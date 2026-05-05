from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import serializers
import csv

from .models import (
    Profile,
    Document,
    Major,
    SubjectCombination,
    AdmissionMethod,
    Application,
    MajorBenchmark,
    ScoreFormula,
    Score,
    AdmissionResult,
    DocumentVerificationLog,
    ProfileWorkflowLog,
    AdmissionSeason,
)
from .serializers import (
    ProfileUpdateDTO,
    ProfileResponseDTO,
    DocumentUploadDTO,
    DocumentBulkUploadDTO,
    DocumentResponseDTO,
    MajorSerializer,
    AdmissionMethodSerializer,
    SubjectCombinationSerializer,
    ApplicationCreateDTO,
    ApplicationResponseDTO,
    MajorStatsResponseDTO,
    AdminMajorBenchmarkCRUDSerializer,
    AdmissionSeasonSerializer,
)
from .services import ProfileService, DocumentService, CatalogService, AdmissionService, StatisticService, PaymentService
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


class ScoreFormulaSerializer(serializers.ModelSerializer):
    method_name = serializers.CharField(source='method.name', read_only=True)
    class Meta:
        model = ScoreFormula
        fields = '__all__'

class MajorCRUDSerializer(serializers.ModelSerializer):
    class Meta:
        model = Major
        fields = '__all__'

class SubjectCombinationCRUDSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectCombination
        fields = '__all__'

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'ADMIN'


class AdminDocumentSerializer(serializers.ModelSerializer):
    latest_rejection_reason = serializers.SerializerMethodField()
    verification_history = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'

    def get_latest_rejection_reason(self, obj):
        latest_reject = obj.verification_logs.filter(to_status='REJECTED').order_by('-created_at').first()
        return latest_reject.reason if latest_reject else None

    def get_verification_history(self, obj):
        logs = obj.verification_logs.select_related('actor').order_by('-created_at')[:10]
        return [
            {
                "id": str(item.id),
                "from_status": item.from_status,
                "to_status": item.to_status,
                "reason": item.reason,
                "actor": item.actor.full_name if item.actor else "SYSTEM",
                "created_at": item.created_at,
            }
            for item in logs
        ]


class AdminProfileSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    cccd = serializers.CharField(source='user.cccd', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    documents = AdminDocumentSerializer(many=True, read_only=True)
    scores = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    workflow_history = serializers.SerializerMethodField()
    applications = ApplicationResponseDTO(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = '__all__'
    
    def get_scores(self, obj):
        # Tận dụng prefetch_related cache thay vì query DB
        scores = obj.scores.all()
        return {s.subject: s.score for s in scores}
    
    def get_payment_status(self, obj):
        # Tận dụng prefetch_related cache từ user.payments
        payments = obj.user.payments.all()
        for p in payments:
            if p.status == 'SUCCESS':
                return 'SUCCESS'
        return 'PENDING'

    def get_workflow_history(self, obj):
        logs = ProfileWorkflowLog.objects.filter(profile=obj).select_related('actor').order_by('-created_at')[:20]
        return [
            {
                "id": str(item.id),
                "from_status": item.from_status,
                "to_status": item.to_status,
                "action": item.action,
                "note": item.note,
                "actor": item.actor.full_name if item.actor else "SYSTEM",
                "created_at": item.created_at,
            }
            for item in logs
        ]


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = ProfileService.get_my_profile(request.user)
            data = ProfileResponseDTO(profile).data
            return Response(data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        serializer = ProfileUpdateDTO(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = ProfileService.update_my_profile(request.user, serializer.validated_data)
            data = ProfileResponseDTO(profile).data
            return Response(data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProfileSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            profile = ProfileService.submit_my_profile(request.user)
            data = ProfileResponseDTO(profile).data
            return Response(data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MyScoresView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = ProfileService.get_my_profile(request.user)
            from .models import Score
            scores = Score.objects.filter(profile=profile)
            from .serializers import ScoreSerializer
            return Response(ScoreSerializer(scores, many=True).data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        # request.data is a list of {"subject": "Toán", "score": 8.5}
        try:
            profile = ProfileService.get_my_profile(request.user)
            normalized_status = ProfileService.normalize_status(profile.status)
            if normalized_status in ['VERIFIED', 'PAID', 'RANKED', 'RESULT_PUBLISHED']:
                return Response({"error": "Hồ sơ đã được duyệt, không thể sửa điểm."}, status=status.HTTP_403_FORBIDDEN)
            
            # Validate payload
            from .serializers import ScoreSerializer
            serializer = ScoreSerializer(data=request.data, many=True)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            from .models import Score
            # Xoá điểm cũ
            Score.objects.filter(profile=profile).delete()
            # Lưu điểm mới
            new_scores = []
            for item in serializer.validated_data:
                new_scores.append(Score(profile=profile, subject=item['subject'], score=item['score']))
            Score.objects.bulk_create(new_scores)

            return Response(ScoreSerializer(new_scores, many=True).data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DocumentListUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        docs = DocumentService.get_my_documents(request.user)
        data = DocumentResponseDTO(docs, many=True).data
        return Response(data)

    def post(self, request):
        # Chuyển đổi dữ liệu sang định dạng list nếu chỉ có 1 file
        files = request.FILES.getlist('files')
        data = {
            'doc_type': request.data.get('doc_type'),
            'files': files
        }
        
        serializer = DocumentBulkUploadDTO(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            uploaded_docs = []
            for file_obj in serializer.validated_data['files']:
                doc = DocumentService.upload_document(
                    user=request.user,
                    doc_type=serializer.validated_data['doc_type'],
                    file_obj=file_obj,
                )
                uploaded_docs.append(doc)
            
            return Response(DocumentResponseDTO(uploaded_docs, many=True).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DocumentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, doc_id):
        try:
            DocumentService.delete_document(request.user, doc_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

class CatalogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        catalogs = CatalogService.get_all_catalogs()
        return Response({
            "majors": MajorSerializer(catalogs["majors"], many=True).data,
            "methods": AdmissionMethodSerializer(catalogs["methods"], many=True).data,
            "combinations": SubjectCombinationSerializer(catalogs["combinations"], many=True).data
        })

class ApplicationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        apps = AdmissionService.get_my_applications(request.user)
        return Response(ApplicationResponseDTO(apps, many=True).data)

    def post(self, request):
        serializer = ApplicationCreateDTO(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            app = AdmissionService.submit_application(request.user, serializer.validated_data)
            return Response(ApplicationResponseDTO(app).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, app_id):
        serializer = ApplicationCreateDTO(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            app = AdmissionService.update_application(request.user, app_id, serializer.validated_data)
            return Response(ApplicationResponseDTO(app).data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, app_id):
        try:
            AdmissionService.delete_application(request.user, app_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

class MajorStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('search', None)
        stats = StatisticService.get_major_stats(query)
        return Response(MajorStatsResponseDTO(stats, many=True).data)

class PaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        summary = PaymentService.get_payment_summary(request.user)
        return Response(summary)

class PaymentInitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Mặc định dùng VNPAY
            payment = PaymentService.initiate_payment(request.user, payment_method='VNPAY')
            return Response({
                "pay_url": payment.pay_url,
                "order_id": payment.order_id,
                "method": payment.method,
            })
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class PaymentCallbackView(APIView):
    # VNPay gọi callback không có Bearer Token, ta bảo mật bằng signature bên trong service
    permission_classes = [] 

    def get(self, request):
        # VNPay dùng GET cho cả ReturnUrl và IPN
        data = request.query_params.dict()
        success = PaymentService.process_callback(data)
        
        # Sau khi xử lý callback, redirect thí sinh về trang kết quả trên Frontend
        frontend_url = settings.VNPAY_RETURN_URL
        status_str = "success" if success and data.get('vnp_ResponseCode') == '00' else "failed"
        return HttpResponseRedirect(f"{frontend_url}?status={status_str}&orderId={data.get('vnp_TxnRef')}")

class AdminProfileListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        status_filter = request.query_params.get('status', None)
        year_filter = request.query_params.get('year', None)
        profiles = Profile.objects.select_related('user').prefetch_related(
            'documents',
            'applications__major',
            'applications__method',
            'applications__combination',
            'scores',
            'user__payments',
        ).all().order_by('-created_at')
        if year_filter:
            profiles = profiles.filter(created_at__year=int(year_filter))
        if status_filter:
            if status_filter in ['PENDING', 'PENDING_VERIFY']:
                profiles = profiles.filter(status__in=['PENDING', 'PENDING_VERIFY'])
            else:
                profiles = profiles.filter(status=status_filter)
        return Response(AdminProfileSerializer(profiles, many=True).data)

class AdminProfileDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, profile_id):
        profile = Profile.objects.select_related('user').prefetch_related(
            'documents',
            'applications__major',
            'applications__method',
            'applications__combination',
            'scores',
            'user__payments',
        ).filter(id=profile_id).first()
        if not profile:
            return Response({"error": "Không tìm thấy hồ sơ"}, status=status.HTTP_404_NOT_FOUND)
        return Response(AdminProfileSerializer(profile).data)

class AdminVerifyProfileView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, profile_id):
        new_status = request.data.get('status')
        reason = request.data.get('rejection_reason', '')

        try:
            profile = ProfileService.verify_profile(profile_id, new_status, reason, actor=request.user)
            return Response(AdminProfileSerializer(profile).data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminVerifyDocumentView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, doc_id):
        new_status = request.data.get('status')
        reason = request.data.get('reason', '')
        try:
            document = DocumentService.verify_document(doc_id, new_status, reason=reason, actor=request.user)
            return Response(AdminDocumentSerializer(document).data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminConfirmPaymentView(APIView):
    """Admin xác nhận thủ công thanh toán cho thí sinh (trường hợp chuyển khoản bên ngoài)."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, profile_id):
        from .models import Payment, Profile as AdmissionProfile
        import uuid as uuid_lib

        profile = AdmissionProfile.objects.filter(id=profile_id).first()
        if not profile:
            return Response({"error": "Không tìm thấy hồ sơ"}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra đã có payment SUCCESS chưa
        existing = Payment.objects.filter(user=profile.user, status='SUCCESS').first()
        if existing:
            return Response({"error": "Thí sinh này đã có xác nhận thanh toán."}, status=status.HTTP_400_BAD_REQUEST)

        note = request.data.get('note', 'Xác nhận thủ công bởi admin')
        Payment.objects.create(
            user=profile.user,
            order_id=f"MANUAL-{uuid_lib.uuid4().hex[:12].upper()}",
            amount=500000,
            method='MANUAL',
            status='SUCCESS',
            transaction_code=f"ADM-{request.user.id}",
            extra_data=note,
        )

        # Log
        ProfileWorkflowLog.objects.create(
            profile=profile,
            actor=request.user,
            from_status=profile.status,
            to_status=profile.status,
            action='MANUAL_PAYMENT_CONFIRMED',
            note=note,
        )

        updated = AdminProfileSerializer(profile).data
        updated['payment_status'] = 'SUCCESS'
        return Response(updated)

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        stats = StatisticService.get_admin_dashboard_stats()
        return Response(stats)

class AdminMajorCRUDView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        majors = Major.objects.all().order_by('code')
        serializer = MajorCRUDSerializer(majors, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MajorCRUDSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        major = Major.objects.filter(id=pk).first()
        if not major:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = MajorCRUDSerializer(major, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        major = Major.objects.filter(id=pk).first()
        if not major:
            return Response(status=status.HTTP_404_NOT_FOUND)
        major.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminMethodCRUDView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        methods = AdmissionMethod.objects.all().order_by('name')
        serializer = AdmissionMethodSerializer(methods, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AdmissionMethodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        method = AdmissionMethod.objects.filter(id=pk).first()
        if not method:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AdmissionMethodSerializer(method, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        method = AdmissionMethod.objects.filter(id=pk).first()
        if not method:
            return Response(status=status.HTTP_404_NOT_FOUND)
        method.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminCombinationCRUDView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        combs = SubjectCombination.objects.all().order_by('code')
        serializer = SubjectCombinationCRUDSerializer(combs, many=True)
        return Response(serializer.data)

    def post(self, request):
        code = request.data.get('code')
        if code and SubjectCombination.objects.filter(code=code).exists():
            return Response({"error": "Tổ hợp với mã này đã tồn tại!"}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = SubjectCombinationCRUDSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        comb = SubjectCombination.objects.filter(id=pk).first()
        comb.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminFormulaCRUDView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        formulas = ScoreFormula.objects.select_related('method').all()
        return Response(ScoreFormulaSerializer(formulas, many=True).data)

    def post(self, request):
        serializer = ScoreFormulaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        formula = ScoreFormula.objects.filter(id=pk).first()
        if not formula: return Response(status=404)
        serializer = ScoreFormulaSerializer(formula, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class AdminRankingView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, major_id):
        results = StatisticService.run_major_ranking(major_id)
        return Response(results)


class AdminPublishResultView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, major_id):
        data = StatisticService.publish_major_results(major_id, actor=request.user)
        return Response(data)

class AdminMajorBenchmarkCRUDView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        major_id = request.query_params.get('major_id')
        year = request.query_params.get('year')
        benchmarks = MajorBenchmark.objects.select_related('major', 'method').all().order_by('-year', 'major__code')
        if major_id:
            benchmarks = benchmarks.filter(major_id=major_id)
        if year:
            benchmarks = benchmarks.filter(year=int(year))
        return Response(AdminMajorBenchmarkCRUDSerializer(benchmarks, many=True).data)

    def post(self, request):
        serializer = AdminMajorBenchmarkCRUDSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        benchmark = MajorBenchmark.objects.filter(id=pk).first()
        if not benchmark:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AdminMajorBenchmarkCRUDSerializer(benchmark, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        benchmark = MajorBenchmark.objects.filter(id=pk).first()
        if not benchmark:
            return Response(status=status.HTTP_404_NOT_FOUND)
        benchmark.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminPublishBenchmarkView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, major_id):
        data = StatisticService.publish_benchmark(major_id)
        return Response(data)


class AdminSendAdmissionEmailsView(APIView):
    """Gửi email thông báo kết quả xét tuyển cho tất cả thí sinh của một ngành."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, major_id):
        major = Major.objects.filter(id=major_id).first()
        if not major:
            return Response({"error": "Không tìm thấy ngành học."}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra đã có kết quả xếp hạng chưa
        has_results = AdmissionResult.objects.filter(application__major=major).exists()
        if not has_results:
            return Response(
                {"error": "Chưa có kết quả xếp hạng. Vui lòng chạy lọc ảo trước."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            data = StatisticService.send_admission_emails(major_id)
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminMajorWorkflowStatusView(APIView):
    """Trả về trạng thái workflow thực tế của một ngành từ DB."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, major_id):
        from datetime import datetime
        from django.db.models import Q

        major = Major.objects.filter(id=major_id).first()
        if not major:
            return Response({"error": "Không tìm thấy ngành."}, status=status.HTTP_404_NOT_FOUND)

        # Bước 1: Đã chạy lọc ảo chưa?
        has_ranked = AdmissionResult.objects.filter(
            application__major=major
        ).exists()

        # Bước 2: Đã công bố kết quả chưa?
        # Kiểm tra có profile nào đã chuyển sang RESULT_PUBLISHED cho ngành này không
        has_published = Profile.objects.filter(
            applications__major=major,
            status='RESULT_PUBLISHED'
        ).exists()

        # Bước 3: Đã chốt điểm chuẩn chưa?
        current_year = datetime.now().year
        has_benchmarked = MajorBenchmark.objects.filter(
            major=major,
            year=current_year
        ).exists()

        # Bước 4: Đã gửi email chưa?
        # Kiểm tra xem có log gửi email nào cho các thí sinh của ngành này không
        has_email_sent = ProfileWorkflowLog.objects.filter(
            profile__applications__major=major,
            action="ADMIN_SEND_EMAIL"
        ).exists()

        # Thống kê nhanh
        total = AdmissionResult.objects.filter(application__major=major).count()
        passed = AdmissionResult.objects.filter(application__major=major, is_passed=True).count()

        return Response({
            "major_id": str(major.id),
            "major_name": major.name,
            "has_ranked": has_ranked,
            "has_published": has_published,
            "has_benchmarked": has_benchmarked,
            "has_email_sent": has_email_sent,
            "stats": {
                "total": total,
                "passed": passed,
                "failed": total - passed,
            }
        })

class AdminExportResultCSVView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, major_id):
        major = Major.objects.filter(id=major_id).first()
        if not major:
            return Response({"error": "Major not found"}, status=status.HTTP_404_NOT_FOUND)
            
        results = AdmissionResult.objects.filter(
            application__major=major,
            is_passed=True
        ).select_related(
            'application__profile__user', 
            'application__method', 
            'application__combination'
        ).order_by('-total_score')

        response = HttpResponse(content_type='text/csv')
        response.content_type = 'text/csv; charset=utf-8-sig'
        response['Content-Disposition'] = f'attachment; filename="Ket_qua_trung_tuyen_{major.code}.csv"'

        writer = csv.writer(response)
        writer.writerow(['STT', 'Họ và tên', 'CCCD', 'Email', 'Phương thức', 'Tổ hợp', 'Tổng điểm', 'Trạng thái'])
        
        for idx, res in enumerate(results, 1):
            user = res.application.profile.user
            writer.writerow([
                idx,
                user.full_name,
                user.cccd,
                user.email,
                res.application.method.name,
                res.application.combination.code if res.application.combination else 'Không',
                round(res.total_score, 2) if res.total_score else 0,
                'Trúng tuyển'
            ])
            
        return response


class CandidateAdmissionLetterDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        passed_result = AdmissionResult.objects.filter(
            application__user=request.user,
            is_passed=True,
            published=True
        ).select_related('application__major', 'application__method').first()

        if not passed_result:
            return Response({"error": "Không có kết quả trúng tuyển hợp lệ."}, status=status.HTTP_404_NOT_FOUND)
        
        profile = Profile.objects.filter(user=request.user).first()

        return Response({
            "candidate_name": request.user.full_name,
            "cccd": request.user.cccd,
            "dob": profile.dob if profile else None,
            "gender": profile.gender if profile else None,
            "address": profile.address if profile else None,
            "major_name": passed_result.application.major.name,
            "major_code": passed_result.application.major.code,
            "method_name": passed_result.application.method.name,
            "total_score": round(passed_result.total_score, 2),
            "year": 2026,
            "status": "Đã trúng tuyển"
        })


class PublicMajorsView(APIView):
    """Danh sách ngành đào tạo - không cần xác thực (public portal)."""
    permission_classes = []

    def get(self, request):
        from django.db.models import Prefetch
        majors = Major.objects.prefetch_related(
            Prefetch('application_set', queryset=Application.objects.select_related('combination').filter(combination__isnull=False))
        ).all().order_by('code')
        
        result = []
        for major in majors:
            combo_codes = list(set([app.combination.code for app in major.application_set.all()]))
            result.append({
                'id': str(major.id),
                'code': major.code,
                'name': major.name,
                'quota': major.quota,
                'description': major.description or '',
                'combinations': combo_codes,
            })
        return Response(result)


class PublicMethodsView(APIView):
    """Danh sách phương thức xét tuyển - không cần xác thực (public portal)."""
    permission_classes = []

    def get(self, request):
        methods = AdmissionMethod.objects.all()
        serializer = AdmissionMethodSerializer(methods, many=True)
        return Response(serializer.data)


class PublicBenchmarksView(APIView):
    """Điểm chuẩn các năm - không cần xác thực (public portal)."""
    permission_classes = []

    def get(self, request):
        benchmarks = (
            MajorBenchmark.objects
            .select_related('major', 'method')
            .all()
            .order_by('-year', 'major__code')
        )
        result = []
        for bm in benchmarks:
            result.append({
                'major_id': str(bm.major.id),
                'major': bm.major.name,
                'code': bm.major.code,
                'method': bm.method.name,
                'year': bm.year,
                'score': bm.score,
            })
        return Response(result)


class AdminSeasonCRUDView(APIView):
    """CRUD cho đợt xét tuyển (AdmissionSeason)."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        year = request.query_params.get('year')
        seasons = AdmissionSeason.objects.all()
        if year:
            seasons = seasons.filter(year=int(year))
        return Response(AdmissionSeasonSerializer(seasons, many=True).data)

    def post(self, request):
        serializer = AdmissionSeasonSerializer(data=request.data)
        if serializer.is_valid():
            # Nếu is_active=True, tắt active của các season cùng năm
            if serializer.validated_data.get('is_active'):
                AdmissionSeason.objects.filter(
                    year=serializer.validated_data['year'],
                    is_active=True
                ).update(is_active=False)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        season = AdmissionSeason.objects.filter(id=pk).first()
        if not season:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AdmissionSeasonSerializer(season, data=request.data)
        if serializer.is_valid():
            if serializer.validated_data.get('is_active'):
                AdmissionSeason.objects.filter(
                    year=serializer.validated_data['year'],
                    is_active=True
                ).exclude(id=pk).update(is_active=False)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        season = AdmissionSeason.objects.filter(id=pk).first()
        if not season:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if season.applications.exists():
            return Response(
                {"error": "Không thể xoá đợt xét tuyển đã có hồ sơ đăng ký."},
                status=status.HTTP_400_BAD_REQUEST
            )
        season.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
