import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, CheckCircle2 } from 'lucide-react';

export default function Register() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white text-center py-4 border-bottom-0 pb-0">
              <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-danger" style={{ width: '64px', height: '64px' }}>
                <UserPlus size={32} />
              </div>
              <h4 className="fw-bold mb-1">Đăng ký Hồ sơ</h4>
              <p className="text-muted small">Khởi tạo tài khoản Thí sinh xét tuyển 2026</p>
            </div>
            
            <div className="card-body p-4 p-md-5 pt-0">
              <form>
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label fw-medium small">Họ và tên thí sinh</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><User size={18} className="text-muted"/></span>
                      <input type="text" className="form-control border-start-0 ps-0" placeholder="Nguyễn Văn A" />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-medium small">Số CMND / CCCD</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><CheckCircle2 size={18} className="text-muted"/></span>
                      <input type="text" className="form-control border-start-0 ps-0" placeholder="00120300..." />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium small">Email (Sử dụng để nhận thông báo)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted"/></span>
                    <input type="email" className="form-control border-start-0 ps-0" placeholder="vidu@email.com" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-medium small mb-1">Tạo mật khẩu</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted"/></span>
                    <input type="password" className="form-control border-start-0 ps-0" placeholder="Ít nhất 8 ký tự" />
                  </div>
                </div>

                <div className="mb-4 form-check">
                  <input className="form-check-input" type="checkbox" id="flexCheckDefault" />
                  <label className="form-check-label small text-muted" htmlFor="flexCheckDefault">
                    Tôi cam kết các thông tin đăng ký ở trên là hoàn toàn chính xác.
                  </label>
                </div>
                
                <button type="button" className="btn btn-danger w-100 py-2 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2">
                  <UserPlus size={18} /> Đồng ý và Tạo tài khoản
                </button>
                
                <div className="text-center small mt-4">
                  <span className="text-muted">Đã có tài khoản chưa? </span>
                  <Link to="/login" className="fw-bold">Đăng nhập</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
