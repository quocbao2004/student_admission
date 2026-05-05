import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Danh mục ngành đào tạo', to: '/majors' },
  { label: 'Phương thức xét tuyển', to: '/methods' },
  { label: 'Điểm chuẩn các năm', to: '/benchmarks' },
  { label: 'Liên hệ & FAQ', to: '/contact' },
  { label: 'Đăng ký hồ sơ', to: '/register' },
  { label: 'Đăng nhập', to: '/login' },
];

const RELATED_LINKS = [
  { label: 'Cổng thông tin sinh viên', href: '#' },
  { label: 'Thư viện điện tử', href: '#' },
  { label: 'Phòng Đào tạo', href: '#' },
  { label: 'Tạp chí Khoa học', href: '#' },
];

export default function Footer() {
  return (
    <footer className="pub-footer mt-auto">
      <div className="container">
        <div className="row g-5">

          {/* Col 1: University info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div>
                <div
                  style={{
                    color: 'var(--uni-primary)',
                    fontWeight: 800,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    lineHeight: 1.2,
                  }}
                >
                  ĐẠI HỌC ABC
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Admission Portal 2026
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.55)', maxWidth: 320 }}>
              Trường Đại học ABC là cơ sở giáo dục đại học công lập trọng điểm, đào tạo nguồn nhân lực chất lượng cao phục vụ sự nghiệp công nghiệp hoá, hiện đại hoá đất nước.
            </p>

            <div className="d-flex gap-2 mt-3">
              {['f', 'yt', 'zl'].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '2px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Contact */}
          <div className="col-lg-3 col-md-6">
            <div className="pub-footer__heading">Liên hệ Tuyển sinh</div>
            <div className="pub-footer__contact-item">
              <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Phòng Đào tạo - Tòa Nhà A1, 123 Đường XYZ, Quận 1, TP. Hồ Chí Minh</span>
            </div>
            <div className="pub-footer__contact-item">
              <Phone size={14} style={{ flexShrink: 0 }} />
              <div>
                <div>1900 1234 (Máy lẻ 1)</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Thứ 2 – Thứ 6: 7:30 – 17:00</div>
              </div>
            </div>
            <div className="pub-footer__contact-item">
              <Mail size={14} style={{ flexShrink: 0 }} />
              <span>tuyensinh@daihocabc.edu.vn</span>
            </div>
          </div>

          {/* Col 3: Quick links */}
          <div className="col-lg-2 col-md-6">
            <div className="pub-footer__heading">Thông tin Tuyển sinh</div>
            {QUICK_LINKS.map((link) => (
              <Link key={link.label} to={link.to}>{link.label}</Link>
            ))}
          </div>

          {/* Col 4: Related links */}
          <div className="col-lg-3 col-md-6">
            <div className="pub-footer__heading">Liên kết</div>
            {RELATED_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="d-flex align-items-center gap-1">
                <ExternalLink size={11} />
                {link.label}
              </a>
            ))}

            <div
              style={{
                marginTop: 20,
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                Đường dây nóng
              </div>
              <div style={{ color: 'var(--uni-gold)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px' }}>
                1900 1234
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="pub-footer__bottom">
        <div className="container">
          © {new Date().getFullYear()} Trường Đại học ABC. Bản quyền thuộc Phòng Đào tạo &amp; Tuyển sinh.
          &nbsp;&bull;&nbsp;
          Chính sách bảo mật &nbsp;&bull;&nbsp; Điều khoản sử dụng
        </div>
      </div>
    </footer>
  );
}
