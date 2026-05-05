import hashlib
import hmac
import json
import uuid
from datetime import datetime
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.db import models

from .models import (
    AdmissionResult,
    Application,
    Document,
    DocumentVerificationLog,
    Major,
    MajorBenchmark,
    Payment,
    Profile,
    ProfileWorkflowLog,
    Score,
    ScoreFormula,
    SubjectCombination,
)
from .repositories import (
    ProfileRepository, 
    DocumentRepository, 
    MajorRepository, 
    AdmissionMethodRepository, 
    SubjectCombinationRepository, 
    ApplicationRepository,
    MajorBenchmarkRepository
)


class ProfileState:
    DRAFT = "DRAFT"
    PENDING_VERIFY = "PENDING_VERIFY"
    REJECTED = "REJECTED"
    VERIFIED = "VERIFIED"
    PAID = "PAID"
    RANKED = "RANKED"
    RESULT_PUBLISHED = "RESULT_PUBLISHED"

    LEGACY_PENDING = "PENDING"

    TRANSITIONS = {
        DRAFT: {PENDING_VERIFY},
        PENDING_VERIFY: {REJECTED, VERIFIED},
        REJECTED: {PENDING_VERIFY},
        VERIFIED: {PAID},
        PAID: {RANKED},
        RANKED: {RESULT_PUBLISHED},
        RESULT_PUBLISHED: set(),
    }

    ALIASES = {
        LEGACY_PENDING: PENDING_VERIFY,
    }

class ProfileService:
    @staticmethod
    def normalize_status(status_value):
        if not status_value:
            return ProfileState.DRAFT
        return ProfileState.ALIASES.get(status_value, status_value)

    @staticmethod
    def _log_transition(profile, actor, from_status, to_status, action, note="", metadata=None):
        ProfileWorkflowLog.objects.create(
            profile=profile,
            actor=actor,
            from_status=from_status,
            to_status=to_status,
            action=action,
            note=note,
            metadata=metadata or {},
        )

    @staticmethod
    def transition_profile(profile, to_status, actor=None, action="SYSTEM_UPDATE", note="", metadata=None, force=False):
        from_status = ProfileService.normalize_status(profile.status)
        to_status = ProfileService.normalize_status(to_status)

        if not force and to_status not in ProfileState.TRANSITIONS.get(from_status, set()):
            raise ValueError(f"Không thể chuyển trạng thái từ {from_status} sang {to_status}.")

        profile.status = to_status
        if to_status != ProfileState.REJECTED:
            profile.rejection_reason = None
        profile.save(update_fields=["status", "rejection_reason"])
        ProfileService._log_transition(profile, actor, from_status, to_status, action, note, metadata)
        return profile

    @staticmethod
    def get_my_profile(user):
        profile = ProfileRepository.get_by_user_id(user.id)
        if not profile:
            raise ValueError("Hồ sơ không tồn tại.")
        return profile

    @staticmethod
    def update_my_profile(user, validated_data: dict):
        profile = ProfileRepository.get_by_user_id(user.id)
        if not profile:
            raise ValueError("Hồ sơ không tồn tại.")
        normalized_status = ProfileService.normalize_status(profile.status)
        if normalized_status in {ProfileState.PAID, ProfileState.RANKED, ProfileState.RESULT_PUBLISHED}:
            raise ValueError("Hồ sơ đã qua giai đoạn chỉnh sửa.")
        updated = ProfileRepository.update(profile, validated_data)
        return updated

    @staticmethod
    def submit_my_profile(user):
        profile = ProfileRepository.get_by_user_id(user.id)
        if not profile:
            raise ValueError("Hồ sơ không tồn tại.")
        normalized_status = ProfileService.normalize_status(profile.status)
        if normalized_status != ProfileState.DRAFT:
            raise ValueError("Hồ sơ đã được gửi đi.")
        
        has_required_data = all(
            [profile.dob, profile.gender, profile.address and str(profile.address).strip()]
        )
        if not has_required_data:
            raise ValueError("Bạn cần điền đủ thông tin cá nhân (Ngày sinh, Giới tính, Địa chỉ) trước khi nộp hồ sơ.")

        # Check if they have scores
        from .models import Score, Document
        if not Score.objects.filter(profile=profile).exists():
            raise ValueError("Bạn cần nhập điểm học bạ trước khi nộp hồ sơ.")
            
        # Check if they have the required ACADEMIC_RECORD doc
        if not Document.objects.filter(profile=profile, type='ACADEMIC_RECORD').exists():
            raise ValueError("Bạn cần tải lên ảnh học bạ trước khi nộp hồ sơ.")

        updated = ProfileService.transition_profile(
            profile,
            ProfileState.PENDING_VERIFY,
            actor=user,
            action="CANDIDATE_SUBMIT_PROFILE",
            note="Thí sinh hoàn tất thông tin hồ sơ và gửi duyệt.",
        )
        return updated

    @staticmethod
    def verify_profile(profile_id, new_status, rejection_reason, actor=None):
        profile = Profile.objects.filter(id=profile_id).first()
        if not profile:
            raise ValueError("Không tìm thấy hồ sơ thí sinh.")

        normalized_target = ProfileService.normalize_status(new_status)
        allowed_admin_targets = {
            ProfileState.PENDING_VERIFY,
            ProfileState.REJECTED,
            ProfileState.VERIFIED,
        }
        if normalized_target not in allowed_admin_targets:
            raise ValueError("Trạng thái không hợp lệ.")

        if normalized_target == ProfileState.REJECTED and not rejection_reason:
            raise ValueError("Vui lòng nhập lý do từ chối.")

        updated = ProfileService.transition_profile(
            profile,
            normalized_target,
            actor=actor,
            action="ADMIN_VERIFY_PROFILE",
            note=rejection_reason if normalized_target == ProfileState.REJECTED else "Hồ sơ đã được admin xử lý.",
            metadata={"rejection_reason": rejection_reason or ""},
            force=False,
        )

        if normalized_target == ProfileState.REJECTED:
            updated.rejection_reason = rejection_reason
            updated.save(update_fields=["rejection_reason"])
        return updated

class DocumentService:
    @staticmethod
    def get_my_documents(user):
        profile = ProfileRepository.get_by_user_id(user.id)
        if not profile:
            return []
        return DocumentRepository.get_by_profile(profile.id)

    @staticmethod
    def upload_document(user, doc_type, file_obj):
        profile = ProfileRepository.get_by_user_id(user.id)
        if not profile:
            raise ValueError("Hồ sơ không tồn tại. Vui lòng tạo hồ sơ trước.")
        if Payment.objects.filter(user=user, status='SUCCESS').exists():
            raise ValueError("Đã thanh toán lệ phí. Bạn không thể thay đổi minh chứng.")
        return DocumentRepository.save_document(profile, doc_type, file_obj)

    @staticmethod
    def delete_document(user, doc_id):
        profile = ProfileRepository.get_by_user_id(user.id)
        if not profile:
            raise ValueError("Hồ sơ không tồn tại.")
        if Payment.objects.filter(user=user, status='SUCCESS').exists():
            raise ValueError("Đã thanh toán lệ phí. Bạn không thể thay đổi minh chứng.")
        success = DocumentRepository.delete_document(doc_id, profile.id)
        if not success:
            raise ValueError("Tài liệu không tồn tại hoặc bạn không có quyền xoá.")

    @staticmethod
    def verify_document(doc_id, new_status, reason="", actor=None):
        doc = Document.objects.select_related("profile").filter(id=doc_id).first()
        if not doc:
            raise ValueError("Không tìm thấy tài liệu.")

        normalized_status = ProfileService.normalize_status(new_status)
        if normalized_status not in {ProfileState.VERIFIED, ProfileState.REJECTED, ProfileState.PENDING_VERIFY}:
            raise ValueError("Trạng thái duyệt tài liệu không hợp lệ.")
        if normalized_status == ProfileState.REJECTED and not reason:
            raise ValueError("Vui lòng nhập lý do từ chối tài liệu.")

        from_status = ProfileService.normalize_status(doc.status)
        doc.status = normalized_status
        doc.save(update_fields=["status"])

        DocumentVerificationLog.objects.create(
            document=doc,
            actor=actor,
            from_status=from_status,
            to_status=normalized_status,
            reason=reason or None,
            action="ADMIN_VERIFY_DOCUMENT",
        )
        return doc

class CatalogService:
    @staticmethod
    def get_all_catalogs():
        from .models import AdmissionSeason
        active_season = AdmissionSeason.objects.filter(is_active=True, status='OPEN').first()
        season_data = None
        if active_season:
            season_data = {
                "id": str(active_season.id),
                "name": active_season.name,
                "year": active_season.year,
                "round_number": active_season.round_number
            }
        return {
            "majors": MajorRepository.get_all(),
            "methods": AdmissionMethodRepository.get_all(),
            "combinations": SubjectCombinationRepository.get_all(),
            "active_season": season_data
        }

class AdmissionService:
    @staticmethod
    def _ensure_editable(profile):
        from .models import AdmissionSeason
        active_season = AdmissionSeason.objects.filter(is_active=True, status='OPEN').first()
        if not active_season:
            raise ValueError("Hiện tại không có đợt tuyển sinh nào đang mở đăng ký.")
            
        if Payment.objects.filter(user=profile.user, status='SUCCESS').exists():
            raise ValueError("Bạn đã thanh toán lệ phí, không thể chỉnh sửa nguyện vọng.")

    @staticmethod
    def get_my_applications(user):
        profile = ProfileRepository.get_by_user_id(user.id)
        if not profile:
            return []
        return ApplicationRepository.get_by_profile(profile.id)

    @staticmethod
    def submit_application(user, data):
        profile = ProfileRepository.get_by_user_id(user.id)
        if not profile:
            raise ValueError("Hồ sơ không tồn tại.")
        AdmissionService._ensure_editable(profile)
        
        # Kiểm tra giới hạn 3 nguyện vọng
        if ApplicationRepository.count_by_profile(profile.id) >= 3:
            raise ValueError("Bạn chỉ được đăng ký tối đa 3 nguyện vọng.")

        major = MajorRepository.get_by_id(data['major_id'])
        method = AdmissionMethodRepository.get_by_id(data['method_id'])
        combination = None
        if data.get('combination_id'):
            combination = SubjectCombinationRepository.get_by_id(data['combination_id'])

        if not major or not method:
            raise ValueError("Ngành hoặc Phương thức không hợp lệ.")

        # Kiểm tra xem phương thức có được phép áp dụng cho ngành này không
        if major.allowed_methods.exists() and not major.allowed_methods.filter(id=method.id).exists():
            raise ValueError(f"Ngành {major.code} không áp dụng phương thức xét tuyển này.")

        if combination and major.allowed_combinations.exists() and not major.allowed_combinations.filter(id=combination.id).exists():
            raise ValueError(f"Ngành {major.code} không áp dụng tổ hợp môn này.")

        # Tự động tính thứ tự ưu tiên
        priority_order = ApplicationRepository.count_by_profile(profile.id) + 1

        return ApplicationRepository.create(
            profile=profile,
            major=major,
            method=method,
            combination=combination,
            priority_order=priority_order
        )

    @staticmethod
    def update_application(user, app_id, data):
        profile = ProfileRepository.get_by_user_id(user.id)
        if not profile:
            raise ValueError("Hồ sơ không tồn tại.")
        AdmissionService._ensure_editable(profile)
        
        application = ApplicationRepository.get_by_id_and_profile(app_id, profile.id)
        if not application:
            raise ValueError("Nguyện vọng không tồn tại.")

        update_data = {}
        if 'major_id' in data:
            major = MajorRepository.get_by_id(data['major_id'])
            if major: update_data['major'] = major
        
        if 'method_id' in data:
            method = AdmissionMethodRepository.get_by_id(data['method_id'])
            if method: update_data['method'] = method
            
        current_major = update_data.get('major', application.major)
        current_method = update_data.get('method', application.method)
        
        if current_major.allowed_methods.exists() and not current_major.allowed_methods.filter(id=current_method.id).exists():
            raise ValueError(f"Ngành {current_major.code} không áp dụng phương thức xét tuyển này.")
            
        if 'combination_id' in data:
            combination = None
            if data['combination_id']:
                combination = SubjectCombinationRepository.get_by_id(data['combination_id'])
            update_data['combination'] = combination
            
        current_combination = update_data.get('combination', application.combination)
        if current_combination and current_major.allowed_combinations.exists() and not current_major.allowed_combinations.filter(id=current_combination.id).exists():
            raise ValueError(f"Ngành {current_major.code} không áp dụng tổ hợp môn này.")

        return ApplicationRepository.update(application, update_data)

    @staticmethod
    def delete_application(user, app_id):
        profile = ProfileRepository.get_by_user_id(user.id)
        if not profile:
            raise ValueError("Hồ sơ không tồn tại.")
        AdmissionService._ensure_editable(profile)
        
        application = ApplicationRepository.get_by_id_and_profile(app_id, profile.id)
        if not application:
            raise ValueError("Nguyện vọng không tồn tại.")
        
        ApplicationRepository.delete(application)

        # Re-order priorities after delete
        apps = ApplicationRepository.get_by_profile(profile.id)
        for i, app in enumerate(apps):
            ApplicationRepository.update(app, {"priority_order": i + 1})

        return True

class StatisticService:
    @staticmethod
    def get_major_stats(search_query=None):
        if search_query:
            majors = MajorRepository.search(search_query)
        else:
            majors = MajorRepository.get_all()
        
        results = []
        for major in majors:
            app_count = MajorRepository.get_application_count(major.id)
            benchmarks = MajorBenchmarkRepository.get_by_major(major.id)
            
            # Tính tỷ lệ chọi (match rate)
            match_rate = 0
            if major.quota > 0:
                match_rate = round(app_count / major.quota, 2)
            
            # Gán thêm dữ liệu động vào object major (để serializer bốc lên)
            major.application_count = app_count
            major.match_rate = match_rate
            major.benchmarks_list = benchmarks
            results.append(major)
            
        return results

    @staticmethod
    def run_major_ranking(major_id):
        major = Major.objects.get(id=major_id)
        # Lấy nguyện vọng kèm thông tin tổ hợp và phương thức
        applications = Application.objects.filter(major=major).select_related('profile__user', 'combination', 'method')
        
        results = []
        for app in applications:
            formula_obj = ScoreFormula.objects.filter(method=app.method).first()
            if not formula_obj:
                score = 0
            else:
                # Tìm điểm 3 môn từ bảng scores theo tổ hợp môn thí sinh chọn
                comb = app.combination
                profile_scores = Score.objects.filter(profile=app.profile)
                
                s1 = profile_scores.filter(subject=comb.subject1).first()
                s2 = profile_scores.filter(subject=comb.subject2).first()
                s3 = profile_scores.filter(subject=comb.subject3).first()
                
                context = {
                    's1': s1.score if s1 else 0,
                    's2': s2.score if s2 else 0,
                    's3': s3.score if s3 else 0,
                    'bonus': 0.75 if app.profile.priority_area == 'KV1' else 0.5 if 'KV2' in (app.profile.priority_area or '') else 0
                }
                
                try:
                    expr = formula_obj.formula.replace(' ', '')
                    context['avg'] = (context['s1'] + context['s2'] + context['s3']) / 3
                    score = eval(expr, {"__builtins__": None}, context)
                except:
                    score = 0
            
            results.append({
                "application_id": app.id,
                "candidate_name": app.profile.user.full_name,
                "cccd": app.profile.user.cccd,
                "score": round(score, 2),
                "method": app.method.name,
                "combination": app.combination.code if app.combination else None
            })

        # Xếp hạng từ cao xuống thấp
        results.sort(key=lambda x: x['score'], reverse=True)
        
        # Xoá kết quả cũ của ngành này và lưu mới
        app_ids = [r['application_id'] for r in results]
        AdmissionResult.objects.filter(application_id__in=app_ids).delete()

        final_data = []
        for i, res in enumerate(results):
            is_passed = (i < major.quota)
            
            # Lưu vào bảng admission_results theo đúng SQL
            AdmissionResult.objects.create(
                application_id=res['application_id'],
                total_score=res['score'],
                is_passed=is_passed,
                ranked_position=i + 1
            )
            
            res['status'] = 'ACCEPTED' if is_passed else 'REJECTED'
            res['rank'] = i + 1
            final_data.append(res)

            app = Application.objects.filter(id=res['application_id']).select_related("profile").first()
            if app and app.profile:
                current_status = ProfileService.normalize_status(app.profile.status)
                if current_status in {ProfileState.PAID, ProfileState.RANKED}:
                    if current_status != ProfileState.RANKED:
                        ProfileService.transition_profile(
                            app.profile,
                            ProfileState.RANKED,
                            actor=None,
                            action="SYSTEM_RANKING_COMPLETED",
                            note=f"Hệ thống đã chạy lọc ảo cho ngành {major.code}.",
                        )
        
        return final_data

    @staticmethod
    def get_admin_dashboard_stats():
        from .models import Profile, Payment, Application
        
        total_profiles = Profile.objects.count()
        verified_profiles = Profile.objects.filter(status='VERIFIED').count()
        pending_profiles = Profile.objects.filter(status__in=['PENDING', ProfileState.PENDING_VERIFY]).count()
        
        # Tính tổng tiền lệ phí đã thu (MoMo SUCCESS)
        total_revenue = Payment.objects.filter(status='SUCCESS').aggregate(models.Sum('amount'))['amount__sum'] or 0
        
        # Lấy lịch sử nộp hồ sơ gần đây (top 5)
        recent_activities = Application.objects.select_related('profile__user', 'major').order_by('-created_at')[:5]
        
        activities = []
        for app in recent_activities:
            activities.append({
                "id": app.id,
                "candidate": app.profile.user.full_name,
                "major": app.major.name,
                "time": app.created_at.isoformat()
            })

        return {
            "total_candidates": total_profiles,
            "verified_count": verified_profiles,
            "pending_count": pending_profiles,
            "total_revenue": float(total_revenue),
            "recent_activities": activities
        }

    @staticmethod
    def publish_major_results(major_id, actor=None):
        applications = Application.objects.filter(major_id=major_id).select_related("profile")
        published = 0
        for app in applications:
            profile = app.profile
            if not profile:
                continue
            current = ProfileService.normalize_status(profile.status)
            if current == ProfileState.RANKED:
                ProfileService.transition_profile(
                    profile,
                    ProfileState.RESULT_PUBLISHED,
                    actor=actor,
                    action="ADMIN_PUBLISH_RESULTS",
                    note="Công bố kết quả xét tuyển.",
                    metadata={"major_id": str(major_id)},
                )
                published += 1
        return {"published_count": published}

    @staticmethod
    def publish_benchmark(major_id):
        major = Major.objects.get(id=major_id)
        results = AdmissionResult.objects.filter(application__major=major, is_passed=True).select_related('application__method')
        
        benchmarks = {}
        for res in results:
            method_id = res.application.method_id
            if method_id not in benchmarks:
                benchmarks[method_id] = res.total_score
            else:
                if res.total_score < benchmarks[method_id]:
                    benchmarks[method_id] = res.total_score
                    
        year = datetime.now().year
        created_benchmarks = []
        for method_id, min_score in benchmarks.items():
            bm, created = MajorBenchmark.objects.update_or_create(
                major_id=major_id,
                method_id=method_id,
                year=year,
                defaults={'score': round(min_score, 2)}
            )
            created_benchmarks.append(bm)
            
        return {"published_benchmarks": len(created_benchmarks), "year": year}

    @staticmethod
    def send_admission_emails(major_id):
        """Gửi email thông báo trúng tuyển/không đạt cho tất cả thí sinh đã xếp hạng trong ngành."""
        from django.core.mail import send_mail
        from django.conf import settings

        major = Major.objects.get(id=major_id)
        results = AdmissionResult.objects.filter(
            application__major=major
        ).select_related('application__profile__user', 'application__method')

        sent_count = 0
        failed_count = 0
        errors = []

        for res in results:
            user = res.application.profile.user
            if not user.email:
                continue

            if res.is_passed:
                subject = f"[Thông báo trúng tuyển] {major.name} - {major.code}"
                message = (
                    f"Kính gửi {user.full_name},\n\n"
                    f"Chúng tôi vui mừng thông báo bạn đã TRÚNG TUYỂN vào ngành:\n"
                    f"  Ngành: {major.name} ({major.code})\n"
                    f"  Phương thức: {res.application.method.name}\n"
                    f"  Tổng điểm: {round(res.total_score, 2)}\n"
                    f"  Hạng: {res.ranked_position}\n\n"
                    f"Vui lòng đăng nhập vào hệ thống để xem Giấy báo trúng tuyển chi tiết.\n\n"
                    f"Trân trọng,\nBan Tuyển sinh"
                )
            else:
                subject = f"[Thông báo kết quả xét tuyển] {major.name} - {major.code}"
                message = (
                    f"Kính gửi {user.full_name},\n\n"
                    f"Chúng tôi thông báo rằng bạn KHÔNG ĐẠT điểm chuẩn vào ngành:\n"
                    f"  Ngành: {major.name} ({major.code})\n"
                    f"  Tổng điểm: {round(res.total_score, 2)}\n"
                    f"  Hạng: {res.ranked_position}\n\n"
                    f"Cảm ơn bạn đã tham gia xét tuyển. Chúc bạn thành công.\n\n"
                    f"Trân trọng,\nBan Tuyển sinh"
                )

            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@admission.edu.vn'),
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                sent_count += 1
                
                # Ghi log lại để lưu trạng thái "Đã gửi email" vào DB
                ProfileWorkflowLog.objects.create(
                    profile=res.application.profile,
                    actor=None,
                    from_status=res.application.profile.status,
                    to_status=res.application.profile.status,
                    action="ADMIN_SEND_EMAIL",
                    note="Hệ thống đã gửi email thông báo kết quả."
                )
            except Exception as e:
                failed_count += 1
                errors.append(str(e))

        if failed_count > 0 and sent_count == 0:
            error_msg = errors[0] if errors else "Lỗi cấu hình SMTP."
            raise ValueError(f"Gửi thất bại toàn bộ {failed_count} email. Vui lòng kiểm tra lại cấu hình tài khoản Email (App Password). Lỗi chi tiết: {error_msg}")

        return {
            "major": major.name,
            "sent_count": sent_count,
            "failed_count": failed_count,
            "errors": errors[:5],  # Trả về tối đa 5 lỗi đầu tiên
        }


class VnpayService:
    @staticmethod
    def _sort_payload(payload: dict):
        return {k: payload[k] for k in sorted(payload) if payload[k] is not None and str(payload[k]) != ""}

    @staticmethod
    def create_secure_hash(payload: dict):
        secret = settings.VNPAY_HASH_SECRET.strip()
        query_string = urlencode(VnpayService._sort_payload(payload))
        return hmac.new(
            secret.encode("utf-8"),
            query_string.encode("utf-8"),
            hashlib.sha512
        ).hexdigest()

    @staticmethod
    def create_payment_url(order_id, amount, order_info):
        from datetime import timedelta
        create_date = (datetime.utcnow() + timedelta(hours=7)).strftime("%Y%m%d%H%M%S")
        
        payload = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": settings.VNPAY_TMN_CODE.strip(),
            "vnp_Amount": str(int(amount) * 100),
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": str(order_id),
            "vnp_OrderInfo": order_info,
            "vnp_OrderType": "other",
            "vnp_Locale": "vn",
            "vnp_ReturnUrl": settings.VNPAY_RETURN_URL.strip(),
            "vnp_IpAddr": "13.160.92.202",
            "vnp_CreateDate": create_date,
        }
        
        secure_hash = VnpayService.create_secure_hash(payload)
        query_string = urlencode(VnpayService._sort_payload(payload))
        return f"{settings.VNPAY_ENDPOINT}?{query_string}&vnp_SecureHash={secure_hash}"

    @staticmethod
    def validate_callback_signature(data: dict):
        received_hash = data.get("vnp_SecureHash")
        if not received_hash:
            return False
        payload = {k: v for k, v in data.items() if k.startswith("vnp_") and k not in {"vnp_SecureHash", "vnp_SecureHashType"}}
        expected_hash = VnpayService.create_secure_hash(payload)
        return hmac.compare_digest(expected_hash, received_hash)

class PaymentService:
    @staticmethod
    def get_fee_per_aspiration():
        return 30000

    @staticmethod
    def get_payment_summary(user):
        profile = ProfileService.get_my_profile(user)
        normalized_status = ProfileService.normalize_status(profile.status)
        app_count = ApplicationRepository.count_by_profile(profile.id)
        total_amount = app_count * PaymentService.get_fee_per_aspiration()
        latest_payment = Payment.objects.filter(user=user, status='SUCCESS').first()
        
        return {
            "app_count": app_count,
            "fee_per_app": PaymentService.get_fee_per_aspiration(),
            "total_amount": total_amount,
            "is_paid": latest_payment is not None,
            "profile_status": normalized_status,
        }

    @staticmethod
    def initiate_payment(user, payment_method="VNPAY"):
        summary = PaymentService.get_payment_summary(user)
        if summary['total_amount'] <= 0:
            raise ValueError("Bạn chưa đăng ký nguyện vọng nào.")
        if summary['is_paid']:
            raise ValueError("Bạn đã hoàn thành thanh toán trước đó.")
        if summary["profile_status"] != ProfileState.VERIFIED:
            raise ValueError("Hồ sơ phải được duyệt trước khi thanh toán lệ phí.")
            
        order_id = f"PAY_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:6].upper()}"
        order_info = f"Payment for admission - {user.email}"
        pay_url = VnpayService.create_payment_url(order_id, summary['total_amount'], order_info)
        
        payment = Payment.objects.create(
            user=user,
            order_id=order_id,
            amount=summary['total_amount'],
            method="VNPAY",
            status='PENDING',
            pay_url=pay_url
        )
        return payment

    @staticmethod
    def process_callback(data):
        if "vnp_TxnRef" not in data:
            return False

        gateway = "VNPAY"
        order_id = data.get("vnp_TxnRef")
        result_code = data.get("vnp_ResponseCode")
        signature_valid = VnpayService.validate_callback_signature(data)
        transaction_code = data.get("vnp_TransactionNo")
        is_success = result_code == "00"

        if not signature_valid:
            return False
        
        payment = Payment.objects.filter(order_id=order_id).first()
        if not payment or payment.method != gateway:
            return False
            
        if is_success:
            payment.status = 'SUCCESS'
            payment.transaction_code = transaction_code
        else:
            payment.status = 'FAILED'
            
        payment.response_data = json.dumps(data)
        payment.save()

        if is_success:
            profile = ProfileRepository.get_by_user_id(payment.user_id)
            if profile:
                current = ProfileService.normalize_status(profile.status)
                if current == ProfileState.VERIFIED:
                    ProfileService.transition_profile(
                        profile,
                        ProfileState.PAID,
                        actor=payment.user,
                        action="PAYMENT_SUCCESS",
                        note=f"Thanh toán thành công qua {gateway}.",
                        metadata={"order_id": payment.order_id},
                    )
        return True
