from .repositories import UserRepository, ProfileRepository

class AuthService:
    """
    Class quản lý Business Logic cho việc xác thực và phân quyền
    """
    
    @staticmethod
    def register_candidate(email, password, full_name, cccd, phone):
        # Kiểm tra user tồn tại
        existing_user = UserRepository.get_user_by_email(email)
        if existing_user:
            raise ValueError("Email already completely registered.")
        
        # Gọi xuống DAO Layer để lưu Database
        user = UserRepository.create_user(
            email=email, 
            password=password, 
            full_name=full_name, 
            cccd=cccd, 
            phone=phone, 
            role='STUDENT'
        )
        
        # Tự động tạo hồ sơ trống
        ProfileRepository.create_profile(user=user)
        
        return user

class ProfileService:
    # Các hàm logic xử lý Profile như: verify_profile, update_priority...
    pass
