import { Link, useLocation } from 'react-router-dom';
import {
  Phone,
  Mail,
  LogIn,
  UserPlus,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Giới thiệu', to: '#' },
  { label: 'Thông tin Tuyển sinh', to: '#' },
  { label: 'Ngành đào tạo', to: '#' },
  { label: 'Điểm chuẩn', to: '#' },
  { label: 'Tin tức & Sự kiện', to: '#' },
  { label: 'Hỏi đáp', to: '#' },
];

export default function PublicHeader() {
  const location = useLocation();

  return (
    <header>
      {/* Top utility bar */}
      <div className="pub-topbar">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <span className="d-flex align-items-center gap-1">
              <Phone size={11} />
              Hotline Tuyển sinh: <strong style={{ color: 'rgba(255,255,255,0.9)' }}>1900 1234</strong>
            </span>
            <div className="divider" />
            <span className="d-flex align-items-center gap-1">
              <Mail size={11} />
              tuyensinh@daihocabc.edu.vn
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <a href="#" className="d-flex align-items-center gap-1">
              Trang chủ chính thức
            </a>
            <div className="divider" />
            <a href="#" className="d-flex align-items-center gap-1">
              Cổng sinh viên
            </a>
            <div className="divider" />
            <Link
              to="/login"
              className="d-flex align-items-center gap-1"
              style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}
            >
              <LogIn size={11} /> Đăng nhập
            </Link>
            <Link
              to="/register"
              style={{
                backgroundColor: 'var(--uni-secondary)',
                color: '#fff',
                padding: '2px 10px',
                borderRadius: '2px',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <UserPlus size={10} style={{ marginRight: 4 }} />
              Đăng ký hồ sơ
            </Link>
          </div>
        </div>
      </div>

      {/* Branding bar */}
      <div className="pub-branding">
        <div className="container d-flex align-items-center gap-4">
          {/* University seal */}
          <div className="pub-branding__seal">
            ĐH<br />ABC
          </div>

          {/* Title */}
          <div className="flex-grow-1">
            <div className="pub-branding__title">
              Trường Đại học ABC
            </div>
            <div className="pub-branding__subtitle">
              Cổng thông tin tuyển sinh &bull; Admission Portal 2026
            </div>
          </div>

          {/* Accreditation badge */}
          <div
            className="d-none d-lg-flex flex-column align-items-center text-center"
            style={{
              borderLeft: '1px solid rgba(255,255,255,0.2)',
              paddingLeft: '24px',
              color: 'rgba(255,255,255,0.65)',
              fontSize: '0.7rem',
              lineHeight: 1.4,
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'var(--uni-gold)', fontWeight: 800, fontSize: '1rem' }}>
              AUN-QA
            </span>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Kiểm định chất lượng
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="pub-navbar navbar navbar-expand-lg p-0">
        <div className="container">
          <button
            className="navbar-toggler py-2 my-1"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#publicNav"
            aria-controls="publicNav"
            aria-expanded="false"
            aria-label="Mở menu"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="publicNav">
            <ul className="navbar-nav mb-2 mb-lg-0">
              {NAV_ITEMS.map((item) => (
                <li className="nav-item" key={item.label}>
                  <Link
                    className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
                    to={item.to}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Call-to-action on right */}
            <div className="ms-auto d-none d-lg-flex align-items-center">
              <Link
                to="/register"
                className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                style={{ borderRadius: '2px', fontSize: '0.78rem', padding: '6px 14px', fontWeight: 700 }}
              >
                Nộp hồ sơ trực tuyến <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
