import { AlertCircle, Clock, CheckCircle, ChevronRight, FileText, CheckSquare, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div>
      {/* Welcome Banner */}
      <div className="card text-white mb-4 border-0 shadow-sm" style={{ backgroundColor: 'var(--uni-primary)' }}>
        <div className="card-body p-4 p-md-5">
          <h3 className="fw-bold mb-2">Chào mừng thí sinh Nguyễn Văn A!</h3>
          <p className="mb-0 text-white-50">Cổng thông tin hướng dẫn và tiếp nhận thủ tục đăng ký xét tuyển trình độ Đại học chính quy năm 2026.</p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fs-6 text-uppercase fw-bold"><CheckSquare size={18} className="me-2 mb-1"/>Tiến độ Hồ sơ Xét tuyển</h5>
        </div>
        <div className="card-body p-4 p-md-5 pt-5 pb-4">
          <div className="stepper mx-auto" style={{ maxWidth: '800px' }}>
            <div className="step completed">
              <div className="step-circle"><CheckCircle size={18} /></div>
              <div className="step-label mt-2">Đăng ký Tài khoản</div>
            </div>
            <div className="step active">
              <div className="step-circle">2</div>
              <div className="step-label mt-2">Cập nhật Hồ sơ</div>
            </div>
            <div className="step">
              <div className="step-circle">3</div>
              <div className="step-label mt-2">Đăng ký NV</div>
            </div>
            <div className="step">
              <div className="step-circle">4</div>
              <div className="step-label mt-2">Thanh toán</div>
            </div>
            <div className="step">
              <div className="step-circle">5</div>
              <div className="step-label mt-2">Xem Kết quả</div>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-muted mb-3">Bạn chưa hoàn thành việc cập nhật hình ảnh học bạ phổ thông.</p>
            <Link to="/candidate/profile" className="btn btn-primary px-4">Đến trang Hồ sơ ngay <ChevronRight size={16} /></Link>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-7 border-end">
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <FileText size={20} className="text-muted"/> Tin tức & Thông báo Tuyển sinh
          </h5>
          
          <div className="mb-3 pb-3 border-bottom">
            <h6 className="fw-bold"><a href="#" className="text-decoration-none">Hướng dẫn tải lên minh chứng Học bạ hợp lệ</a></h6>
            <div className="small text-muted mb-2">Đăng ngày: 15/04/2026 | Chuyên mục: Bằng cấp / Minh chứng</div>
            <p className="small text-muted">Trường Đại học ABC lưu ý thí sinh khi chụp ảnh học bạ cần chụp đủ các trang trang chức điểm số cuối kỳ của 3 năm lớp 10, 11 và 12...</p>
          </div>
          
          <div className="mb-3 pb-3 border-bottom">
            <h6 className="fw-bold"><a href="#" className="text-decoration-none">Gia hạn thời gian nộp lệ phí đợt 1</a></h6>
            <div className="small text-muted mb-2">Đăng ngày: 10/04/2026 | Chuyên mục: Lệ phí</div>
            <p className="small text-muted">Do hệ thống cổng thanh toán quốc gia tạm bảo trì, trường sẽ gia hạn thêm 2 ngày cho mục nộp lệ phí đợt 1.</p>
          </div>
          
          <Link to="#" className="btn btn-outline-primary btn-sm mt-2">Xem tất cả tin tức</Link>
        </div>
        
        <div className="col-md-5 ps-md-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Award size={20} className="text-muted"/> Hỗ trợ trực tuyến
          </h5>
          <div className="card bg-light border-0">
            <div className="card-body">
              <h6 className="fw-bold">Bộ phận giải đáp thắc mắc</h6>
              <p className="small text-muted mb-3">Nếu bạn gặp khó khăn trong quá trình nhập điểm hoặc không thể cập nhật Căn cước công dân. Liên hệ ngay:</p>
              <div className="mb-2 d-flex gap-2 align-items-center bg-white p-2 border rounded">
                <Clock size={16} className="text-danger" /> 
                <div>
                  <div className="fw-medium small">Thời gian làm việc</div>
                  <div className="text-muted small">08:00 - 17:00 (Thứ 2 - Thứ 6)</div>
                </div>
              </div>
              <button className="btn btn-primary w-100 mt-2">Chat với Tư vấn viên</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
