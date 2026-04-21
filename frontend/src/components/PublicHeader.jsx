import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, LogIn, UserPlus, GraduationCap } from 'lucide-react';

export default function PublicHeader() {
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
            <Link to="/login" className="text-decoration-none fw-medium d-flex align-items-center gap-1 text-primary">
              <LogIn size={14} /> Đăng nhập
            </Link>
            <Link to="/register" className="text-decoration-none fw-medium d-flex align-items-center gap-1 text-danger">
              <UserPlus size={14} /> Đăng ký
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
          <button className="navbar-toggler outline-none" type="button" data-bs-toggle="collapse" data-bs-target="#publicNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="publicNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className={`nav-link ${path === '/' ? 'active' : ''}`} to="/">Trang chủ</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#">Giới thiệu</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#">Thông tin tuyển sinh</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#">Ngành đào tạo</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#">Tin tức & Sự kiện</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#">Hỏi đáp (FAQ)</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
