import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, User, LogOut, GraduationCap } from 'lucide-react';

export default function CandidateHeader() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="bg-white shadow-sm">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3 text-muted">
            <span className="d-flex align-items-center gap-1"><Phone size={12} /> Hotline: 1900 1234</span>
            <span className="d-flex align-items-center gap-1"><Mail size={12} /> tuyensinh@abc.edu.vn</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-1">
              <User size={14} className="text-secondary" />
              <span className="fw-medium">Nguyễn Văn A</span>
            </div>
            <Link to="/" className="text-danger d-flex align-items-center gap-1">
              <LogOut size={12} /> Đăng xuất
            </Link>
          </div>
        </div>
      </div>

      {/* Main Branding */}
      <div className="container py-3 d-flex align-items-center gap-3">
        <GraduationCap size={48} color="var(--uni-primary)" />
        <div>
          <h4 className="mb-0 fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Trường Đại học ABC</h4>
          <div className="text-muted small text-uppercase fw-medium">Cổng thông tin tuyển sinh</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-uni p-0">
        <div className="container">
          <button className="navbar-toggler outline-none" type="button" data-bs-toggle="collapse" data-bs-toggle="collapse">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className={`nav-link ${path.includes('dashboard') ? 'active' : ''}`} to="/candidate/dashboard">Trang chủ Thí sinh</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${path.includes('profile') ? 'active' : ''}`} to="/candidate/profile">Hồ sơ cá nhân & Minh chứng</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${path.includes('aspirations') ? 'active' : ''}`} to="/candidate/aspirations">Đăng ký Nguyện vọng</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${path.includes('lookup') ? 'active' : ''}`} to="/candidate/lookup">Tra cứu Kết quả</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${path.includes('payment') ? 'active' : ''}`} to="/candidate/payment">Thanh toán Lệ phí</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
