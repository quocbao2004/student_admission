from .repositories import ApplicationRepository

class AdmissionService:
    """
    Class quản lý Business Logic liên quan đến Xét tuyển
    """
    
    @staticmethod
    def submit_application(profile_id, data):
        # Ví dụ gọi data từ DTO đã được Verify
        # Gọi xuống DAO Layer để tiến hành lưu trữ
        # ApplicationRepository.create_application(...)
        pass
    
    @staticmethod
    def run_allocation_algorithm():
        """
        Nghiệp vụ chạy lọc ảo:
        1. Lấy tất cả Application
        2. Duyệt từ trên xuống điểm ưu tiên
        3. Cập nhật trạng thái Trúng/Trượt vào AdmissionResult
        """
        pass
