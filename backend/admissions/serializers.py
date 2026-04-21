from rest_framework import serializers
from accounts.models import Profile

ALLOWED_DOCUMENT_TYPES = ['ACADEMIC_RECORD', 'IELTS', 'CCCD', 'ACHIEVEMENT']
ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf']
MAX_UPLOAD_SIZE_MB = 5

class ProfileUpdateDTO(serializers.Serializer):
    dob = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=['MALE', 'FEMALE', 'OTHER'], required=False, allow_null=True)
    address = serializers.CharField(max_length=500, required=False, allow_null=True, allow_blank=True)
    priority_area = serializers.CharField(max_length=10, required=False, allow_null=True, allow_blank=True)
    priority_object = serializers.CharField(max_length=10, required=False, allow_null=True, allow_blank=True)

class ProfileResponseDTO(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    user_cccd = serializers.CharField(source='user.cccd', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user_email', 'user_full_name', 'user_cccd', 'user_phone',
                  'dob', 'gender', 'address', 'priority_area', 'priority_object', 'status', 'created_at']

class DocumentUploadDTO(serializers.Serializer):
    doc_type = serializers.ChoiceField(choices=ALLOWED_DOCUMENT_TYPES)
    file = serializers.FileField()

    def validate_file(self, value):
        # Kiểm tra dung lượng
        if value.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise serializers.ValidationError(f"Dung lượng file tối đa là {MAX_UPLOAD_SIZE_MB}MB.")
        # Kiểm tra định dạng
        ext = value.name.split('.')[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(f"Chỉ chấp nhận định dạng: {', '.join(ALLOWED_EXTENSIONS)}.")
        return value

class DocumentResponseDTO(serializers.Serializer):
    id = serializers.UUIDField()
    type = serializers.CharField()
    file_url = serializers.CharField()
    status = serializers.CharField()
    uploaded_at = serializers.DateTimeField()
