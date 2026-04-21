import { Link } from 'react-router-dom';
import { LogIn, Lock, Mail } from 'lucide-react';

export default function Login() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white text-center py-4 border-bottom-0 pb-0">
              <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                <LogIn size={32} color="var(--uni-primary)" />
              </div>
              <h4 className="fw-bold mb-1">Đăng nhập</h4>
              <p className="text-muted small">Dành cho Thí sinh & Cán bộ Tuyển sinh</p>
            </div>
            
            <div className="card-body p-4 p-md-5 pt-0">
              <form>
                <div className="mb-3">
                  <label className="form-label fw-medium small">Email đăng nhập</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted"/></span>
                    <input type="email" className="form-control border-start-0 ps-0" placeholder="vidu@email.com" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-medium small mb-0">Mật khẩu</label>
                    <a href="#" className="small text-decoration-none">Quên mật khẩu?</a>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted"/></span>
                    <input type="password" className="form-control border-start-0 ps-0" placeholder="••••••••" />
                  </div>
                </div>
                
                <button type="button" className="btn btn-primary w-100 py-2 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2">
                  <LogIn size={18} /> Xác thực đăng nhập
                </button>
                
                <div className="text-center small mt-4">
                  <span className="text-muted">Thí sinh chưa có tài khoản? </span>
                  <Link to="/register" className="fw-bold">Đăng ký ngay</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
