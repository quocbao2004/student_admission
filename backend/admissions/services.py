from .repositories import ProfileRepository, DocumentRepository

class ProfileService:
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
        updated = ProfileRepository.update(profile, validated_data)
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
        return DocumentRepository.save_document(profile, doc_type, file_obj)

    @staticmethod
    def delete_document(user, doc_id):
        profile = ProfileRepository.get_by_user_id(user.id)
        if not profile:
            raise ValueError("Hồ sơ không tồn tại.")
        success = DocumentRepository.delete_document(doc_id, profile.id)
        if not success:
            raise ValueError("Tài liệu không tồn tại hoặc bạn không có quyền xoá.")
