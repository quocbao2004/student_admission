import os
import uuid
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db.models import Q
from .models import Document, Major, AdmissionMethod, SubjectCombination, Application, MajorBenchmark
from accounts.models import Profile

class ProfileRepository:
    @staticmethod
    def get_by_user_id(user_id):
        return Profile.objects.filter(user_id=user_id).first()

    @staticmethod
    def update(profile, data: dict):
        for field, value in data.items():
            setattr(profile, field, value)
        profile.save()
        return profile

class DocumentRepository:
    @staticmethod
    def get_by_profile(profile_id):
        return Document.objects.filter(profile_id=profile_id).order_by('-uploaded_at')

    @staticmethod
    def save_document(profile, doc_type, file_obj):
        # Tạo đường dẫn lưu: media/documents/<profile_id>/<uuid>.<ext>
        ext = file_obj.name.split('.')[-1].lower()
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"documents/{profile.id}/{filename}"
        saved_path = default_storage.save(path, ContentFile(file_obj.read()))
        file_url = f"/media/{saved_path}"

        doc = Document.objects.create(
            profile=profile,
            type=doc_type,
            file_url=file_url,
            status='PENDING'
        )
        return doc

    @staticmethod
    def delete_document(doc_id, profile_id):
        doc = Document.objects.filter(id=doc_id, profile_id=profile_id).first()
        if not doc:
            return False
        # Xoá file trên đĩa
        relative_path = doc.file_url.replace('/media/', '', 1)
        if default_storage.exists(relative_path):
            default_storage.delete(relative_path)
        doc.delete()
        return True

class MajorRepository:
    @staticmethod
    def get_all():
        return Major.objects.all().order_by('name')

    @staticmethod
    def get_by_id(major_id):
        return Major.objects.filter(id=major_id).first()

    @staticmethod
    def search(query):
        return Major.objects.filter(
            Q(name__icontains=query) | Q(code__icontains=query)
        ).order_by('name')

    @staticmethod
    def get_application_count(major_id):
        return Application.objects.filter(major_id=major_id).count()

class MajorBenchmarkRepository:
    @staticmethod
    def get_by_major(major_id):
        return MajorBenchmark.objects.filter(major_id=major_id).order_by('-year', 'method__name')

class AdmissionMethodRepository:
    @staticmethod
    def get_all():
        return AdmissionMethod.objects.all().order_by('name')

    @staticmethod
    def get_by_id(method_id):
        return AdmissionMethod.objects.filter(id=method_id).first()

class SubjectCombinationRepository:
    @staticmethod
    def get_all():
        return SubjectCombination.objects.all().order_by('code')

    @staticmethod
    def get_by_id(combination_id):
        return SubjectCombination.objects.filter(id=combination_id).first()

class ApplicationRepository:
    @staticmethod
    def get_by_profile(profile_id):
        return Application.objects.filter(profile_id=profile_id).order_by('priority_order')

    @staticmethod
    def count_by_profile(profile_id):
        return Application.objects.filter(profile_id=profile_id).count()

    @staticmethod
    def create(profile, major, method, combination, priority_order):
        return Application.objects.create(
            profile=profile,
            major=major,
            method=method,
            combination=combination,
            priority_order=priority_order
        )

    @staticmethod
    def get_by_id_and_profile(app_id, profile_id):
        return Application.objects.filter(id=app_id, profile_id=profile_id).first()

    @staticmethod
    def update(application, data: dict):
        for field, value in data.items():
            setattr(application, field, value)
        application.save()
        return application

    @staticmethod
    def delete(application):
        application.delete()
        return True
