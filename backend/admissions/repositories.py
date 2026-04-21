import os
import uuid
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Document
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
