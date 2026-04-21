from rest_framework import serializers

class RegisterCandidateDTO(serializers.Serializer):
    """
    Data Transfer Object dùng để Client gửi yêu cầu đăng ký
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=255)
    cccd = serializers.CharField(max_length=20)
    phone = serializers.CharField(max_length=20)

class ApplicationCreateDTO(serializers.Serializer):
    """
    Ví dụ DTO kiểm tra dữ liệu đăng ký nguyện vọng.
    """
    major_id = serializers.UUIDField()
    method_id = serializers.UUIDField()
    combination_id = serializers.UUIDField(required=False, allow_null=True)
    priority_order = serializers.IntegerField(min_value=1)
