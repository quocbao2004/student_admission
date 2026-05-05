from rest_framework import serializers
from django.core.validators import RegexValidator
from accounts.models import User

class RegisterCandidateDTO(serializers.Serializer):
    """
    Data Transfer Object dùng để Client gửi yêu cầu đăng ký
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=255)
    cccd = serializers.CharField(
        max_length=11,
        min_length=11,
        validators=[RegexValidator(regex=r'^\d{11}$', message='CCCD không hợp lệ. Phải là số và đủ 11 ký tự.')]
    )
    phone = serializers.CharField(
        max_length=10,
        min_length=10,
        validators=[RegexValidator(regex=r'^0[3|5|7|8|9]\d{8}$', message='Số điện thoại không hợp lệ (Phải là 10 số đầu Việt Nam).')]
    )

class UserProfileDTO(serializers.ModelSerializer):
    """Trả về thông tin người dùng hiện tại cho Frontend."""
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'cccd', 'phone', 'role', 'status', 'created_at']

class ApplicationCreateDTO(serializers.Serializer):
    """
    Ví dụ DTO kiểm tra dữ liệu đăng ký nguyện vọng.
    """
    major_id = serializers.UUIDField()
    method_id = serializers.UUIDField()
    combination_id = serializers.UUIDField(required=False, allow_null=True)
    priority_order = serializers.IntegerField(min_value=1)
