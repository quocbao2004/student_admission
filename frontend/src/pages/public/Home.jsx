import { Link } from 'react-router-dom';
import {
  ArrowRight, Clock, FileText, BookOpen, ChevronRight,
  AlertCircle, Users, Award, GraduationCap, Building2,
  CheckCircle2, Calendar, TrendingUp, Shield,
} from 'lucide-react';

const STATS = [
  { num: '60+', label: 'Năm đào tạo', icon: Building2 },
  { num: '85+', label: 'Ngành học', icon: BookOpen },
  { num: '45.000+', label: 'Sinh viên', icon: Users },
  { num: '98%', label: 'Việc làm sau TN', icon: TrendingUp },
];

const ADMISSION_METHODS = [
  { icon: Award, title: 'Xét điểm thi THPT', desc: 'Căn cứ kết quả thi tốt nghiệp THPT Quốc gia 2026' },
  { icon: BookOpen, title: 'Xét học bạ THPT', desc: 'Xét điểm trung bình 5 hoặc 6 học kỳ THPT' },
  { icon: GraduationCap, title: 'Thi đánh giá năng lực', desc: 'Kết quả thi ĐGNL ĐHQG hoặc tương đương' },
  { icon: Shield, title: 'Xét tuyển thẳng', desc: 'Dành cho HS đạt giải Quốc gia, Quốc tế' },
];

const NEWS = [
  {
    category: 'Thông báo chính thức',
    title: 'Công bố đề án tuyển sinh chính thức năm 2026 của Đại học ABC',
    excerpt: 'Trường Đại học ABC vừa chính thức công bố quy chế và đề án tuyển sinh năm 2026 với 5 phương thức xét tuyển nhằm mở rộng cơ hội cho thí sinh trên toàn quốc.',
    date: '12/04/2026',
    isMain: true,
  },
  {
    category: 'Hướng dẫn',
    title: 'Hướng dẫn chi tiết các bước nộp minh chứng Học bạ trực tuyến qua Cổng tuyển sinh',
    excerpt: 'Bài viết hướng dẫn chụp ảnh, chuyển đổi định dạng file để cập nhật lên phần mềm đăng ký nguyện vọng.',
    date: '10/04/2026',
  },
  {
    category: 'Lịch thi',
    title: 'Thông báo lịch thi Đánh giá năng lực đợt 1 năm 2026',
    excerpt: 'Kỳ thi đánh giá năng lực đợt 1 dự kiến tổ chức vào ngày 25/05/2026 tại các điểm thi trong cả nước.',
    date: '05/04/2026',
  },
];

const TIMELINE = [
  { date: '01/03 – 15/05/2026', event: 'Nộp hồ sơ xét học bạ đợt 1', status: 'active' },
  { date: '25/05/2026', event: 'Thi Đánh giá năng lực đợt 1 (ĐHQG)', status: 'upcoming' },
  { date: '26/06 – 30/07/2026', event: 'Đăng ký xét tuyển trên hệ thống BGDĐT', status: 'upcoming' },
  { date: '17/08/2026', event: 'Công bố điểm chuẩn chính thức', status: 'upcoming' },
];

const QUICK_LINKS = [
  { label: 'Danh mục ngành đào tạo 2026', to: '/majors' },
  { label: 'Phương thức xét tuyển', to: '/methods' },
  { label: 'Điểm chuẩn các năm', to: '/benchmarks' },
  { label: 'Quy định ưu tiên khu vực & đối tượng', to: '/methods' },
  { label: 'Câu hỏi thường gặp (FAQ)', to: '/contact' },
];

const STEPS_GUIDE = [
  { num: '01', title: 'Tạo tài khoản', desc: 'Đăng ký bằng CCCD và email cá nhân' },
  { num: '02', title: 'Hoàn thiện hồ sơ', desc: 'Nhập điểm, tải minh chứng học bạ' },
  { num: '03', title: 'Đăng ký nguyện vọng', desc: 'Chọn ngành và phương thức xét tuyển' },
  { num: '04', title: 'Thanh toán & Chờ kết quả', desc: 'Nộp lệ phí và theo dõi kết quả' },
];

export default function Home() {
  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="pub-hero">
        <div className="container position-relative">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="pub-hero__badge">
                <Calendar size={12} style={{ marginRight: 4 }} /> Tuyển sinh 2026
              </div>
              <h1 className="pub-hero__title">
                Cổng Thông Tin<br />
                Tuyển Sinh Đại học ABC
              </h1>
              <p className="pub-hero__desc">
                Nắm bắt cơ hội trúng tuyển vào các ngành đào tạo chất lượng cao.
                Đăng ký hồ sơ trực tuyến, theo dõi trạng thái xét tuyển và tra cứu kết quả tại một nơi duy nhất.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-danger btn-lg d-flex align-items-center gap-2">
                  Đăng ký Hồ sơ ngay <ArrowRight size={18} />
                </Link>
                <Link to="/methods" className="btn btn-outline-light btn-lg d-flex align-items-center gap-2">
                  Xem phương thức xét tuyển
                </Link>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div className="hero-methods-card">
                <div className="hero-methods-card__label">
                  Các phương thức xét tuyển
                </div>
                <div className="row g-2">
                  {ADMISSION_METHODS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <div className="col-6" key={m.title}>
                        <div className="hero-method-item">
                          <div className="hero-method-item__icon"><Icon size={18} /></div>
                          <div className="hero-method-item__title">{m.title}</div>
                          <div className="hero-method-item__desc">{m.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="pub-stats-bar">
        <div className="container">
          <div className="row justify-content-center">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="col-6 col-md-3">
                  <div className="pub-stat-item">
                    <Icon size={16} style={{ color: 'var(--uni-gold)', marginBottom: 4, opacity: 0.8 }} />
                    <div className="pub-stat-item__num">{s.num}</div>
                    <div className="pub-stat-item__label">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <section style={{ padding: '48px 0 40px', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 className="section-heading" style={{ display: 'inline-block' }}>Quy trình đăng ký</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 500, margin: '8px auto 0' }}>
              4 bước đơn giản để hoàn tất hồ sơ xét tuyển trực tuyến
            </p>
          </div>
          <div className="row g-4">
            {STEPS_GUIDE.map((step, idx) => (
              <div className="col-md-3" key={step.num}>
                <div className="step-guide-card">
                  <div className="step-guide-card__num">{step.num}</div>
                  <div className="step-guide-card__title">{step.title}</div>
                  <div className="step-guide-card__desc">{step.desc}</div>
                  {idx < STEPS_GUIDE.length - 1 && (
                    <div className="step-guide-card__arrow d-none d-md-block">
                      <ChevronRight size={18} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-5">
        <div className="container">

          {/* Announcement */}
          <div className="pub-announce d-flex align-items-start gap-2 mb-5">
            <AlertCircle size={16} style={{ flexShrink: 0, color: 'var(--uni-secondary)', marginTop: 1 }} />
            <div>
              <span className="pub-announce__label">Thông báo</span>
              <strong>Hạn nộp hồ sơ trực tuyến xét học bạ đợt 1:</strong>{' '}
              15/05/2026. Thí sinh hoàn thiện đầy đủ thông tin theo hướng dẫn trên Cổng tuyển sinh.{' '}
              <Link to="/contact" style={{ color: 'var(--uni-primary)', fontWeight: 600 }}>Xem chi tiết &rarr;</Link>
            </div>
          </div>

          <div className="row g-4">
            {/* Left — News */}
            <div className="col-lg-8">
              <h2 className="section-heading">Tin tức Tuyển sinh</h2>

              {NEWS.map((item) => (
                <div key={item.title} className="news-card mb-3">
                  <div className="row g-0">
                    <div className={item.isMain ? 'col-md-4' : 'col-md-3'}>
                      <div className="news-card__img" style={{ minHeight: item.isMain ? 180 : 120 }}>
                        <div className="text-center px-3" style={{ fontSize: '0.7rem' }}>
                          <FileText size={28} style={{ opacity: 0.3, marginBottom: 4 }} />
                          <div>Ảnh minh họa</div>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div style={{ padding: '16px 20px' }}>
                        <div className="news-card__category">{item.category}</div>
                        <div className="news-card__title">
                          <Link to="/contact" style={{ fontSize: item.isMain ? '1rem' : '0.9rem' }}>
                            {item.title}
                          </Link>
                        </div>
                        {item.isMain && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8, marginBottom: 0, lineHeight: 1.7 }}>
                            {item.excerpt}
                          </p>
                        )}
                        <div className="news-card__date d-flex align-items-center gap-1 mt-2">
                          <Clock size={12} />
                          {item.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Timeline */}
              <div style={{ marginTop: 40 }}>
                <h2 className="section-heading">Mốc thời gian quan trọng</h2>
                <div className="timeline-table">
                  {TIMELINE.map((row, i) => (
                    <div key={i} className={`timeline-row ${row.status === 'active' ? 'timeline-row--active' : ''}`}>
                      <div className="timeline-row__indicator">
                        {row.status === 'active'
                          ? <CheckCircle2 size={14} />
                          : <div className="timeline-row__dot" />
                        }
                      </div>
                      <div className="timeline-row__date">{row.date}</div>
                      <div className="timeline-row__event">{row.event}</div>
                      <span className={`timeline-row__badge ${row.status === 'active' ? 'timeline-row__badge--active' : ''}`}>
                        {row.status === 'active' ? 'Đang mở' : 'Sắp tới'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Sidebar */}
            <div className="col-lg-4">
              {/* Quick links */}
              <div className="quick-widget mb-4">
                <div className="quick-widget__header">
                  <BookOpen size={16} />
                  Tra nhanh thông tin
                </div>
                {QUICK_LINKS.map((link) => (
                  <Link key={link.label} to={link.to} className="quick-widget__item">
                    <span>{link.label}</span>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>

              {/* Hotline */}
              <div className="hotline-card mb-4">
                <div className="hotline-card__label">Hỗ trợ tuyển sinh</div>
                <div className="hotline-card__number">1900 1234</div>
                <div className="hotline-card__sub">Thứ 2 – Thứ 6: 07:30 – 17:00</div>
                <div style={{ marginTop: 16, height: 1, background: 'rgba(255,255,255,0.12)' }} />
                <div className="d-flex gap-2 mt-3">
                  <a href="mailto:tuyensinh@daihocabc.edu.vn" className="hotline-action-btn">Gửi Email</a>
                  <Link to="/contact" className="hotline-action-btn">Liên hệ</Link>
                </div>
              </div>

              {/* CTA register */}
              <div className="sidebar-cta">
                <Building2 size={24} style={{ color: 'var(--uni-secondary)', marginBottom: 10 }} />
                <div className="sidebar-cta__title">Sẵn sàng đăng ký?</div>
                <p className="sidebar-cta__desc">
                  Tạo tài khoản và hoàn thiện hồ sơ xét tuyển trực tuyến ngay hôm nay.
                </p>
                <Link to="/register" className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2">
                  Đăng ký hồ sơ <ArrowRight size={16} />
                </Link>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10 }}>
                  Đã có tài khoản?{' '}
                  <Link to="/login" style={{ fontWeight: 600 }}>Đăng nhập</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
