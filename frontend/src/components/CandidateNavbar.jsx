import { Link, useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

export default function CandidateNavbar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="navbar navbar-expand-lg px-4 d-flex justify-content-between align-items-center">
      <Link className="navbar-brand fw-bold" to="/candidate/dashboard">
        Admission<span className="text-muted fw-normal">Portal</span>
      </Link>
      
      <div className="d-flex gap-4">
        <Link className={`text-decoration-none ${path.includes('dashboard') ? 'text-main fw-bold' : 'text-muted'}`} to="/candidate/dashboard">Tổng quan</Link>
        <Link className={`text-decoration-none ${path.includes('profile') ? 'text-main fw-bold' : 'text-muted'}`} to="/candidate/profile">Hồ sơ cá nhân</Link>
        <Link className={`text-decoration-none ${path.includes('aspirations') ? 'text-main fw-bold' : 'text-muted'}`} to="/candidate/aspirations">Nguyện vọng</Link>
        <Link className={`text-decoration-none ${path.includes('lookup') ? 'text-main fw-bold' : 'text-muted'}`} to="/candidate/lookup">Tra cứu</Link>
        <Link className={`text-decoration-none ${path.includes('payment') ? 'text-main fw-bold' : 'text-muted'}`} to="/candidate/payment">Thanh toán</Link>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 text-muted">
          <User size={18} />
          <span className="small">Nguyễn Văn A</span>
        </div>
        <Link to="/" className="btn btn-outline-primary btn-sm px-3 d-flex align-items-center gap-2">
          <LogOut size={14} /> Thoát
        </Link>
      </div>
    </nav>
  );
}
