import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  FileText,
  BookOpen,
  ChevronRight,
  AlertCircle,
  Users,
  Award,
  GraduationCap,
  Building2,
} from 'lucide-react';

const STATS = [
  { num: '60+', label: 'Năm đào tạo' },
  { num: '85+', label: 'Ngành học' },
  { num: '45.000+', label: 'Sinh viên' },
  { num: '98%', label: 'Việc làm sau tốt nghiệp' },
];

const ADMISSION_METHODS = [
  { icon: <Award size={20} />, title: 'Xét điểm thi THPT', desc: 'Căn cứ kết quả thi tốt nghiệp THPT Quốc gia 2026' },
  { icon: <BookOpen size={20} />, title: 'Xét học bạ', desc: 'Xét điểm trung bình 5 hoặc 6 học kỳ THPT' },
  { icon: <GraduationCap size={20} />, title: 'Thi đánh giá năng lực', desc: 'Kết quả thi ĐGNL ĐHQG hoặc tương đương' },
  { icon: <Users size={20} />, title: 'Xét tuyển thẳng', desc: 'Dành cho học sinh đạt giải Quốc gia, Quốc tế' },
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
    isMain: false,
  },
  {
    category: 'Lịch thi',
    title: 'Thông báo lịch thi Đánh giá năng lực đợt 1 năm 2026',
    excerpt: 'Kỳ thi đánh giá năng lực đợt 1 dự kiến tổ chức vào ngày 25/05/2026 tại các điểm thi trong cả nước.',
    date: '05/04/2026',
    isMain: false,
  },
];

const QUICK_LINKS = [
  'Danh mục ngành đào tạo 2026',
  'Điều kiện xét tuyển từng phương thức',
  'Quy định ưu tiên khu vực & đối tượng',
  'Học phí dự kiến năm học 2026–2027',
  'Chính sách học bổng tân sinh viên',
  'Câu hỏi thường gặp (FAQ)',
];

export default function Home() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="pub-hero">
        <div className="container position-relative">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="pub-hero__badge">Tuyển sinh 2026</div>
              <h1 className="pub-hero__title">
                Chào mừng Tân Sinh viên<br />
                Đại học ABC khóa 2026
              </h1>
              <p className="pub-hero__desc">
                Nắm bắt cơ hội trúng tuyển vào các ngành đào tạo chất lượng cao. Khám phá phương thức xét tuyển phù hợp và đăng ký hồ sơ trực tuyến ngay hôm nay.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="btn btn-danger btn-lg d-flex align-items-center gap-2"
                >
                  Đăng ký Hồ sơ ngay <ArrowRight size={18} />
                </Link>
                <Link to="#" className="btn btn-outline-light btn-lg d-flex align-items-center gap-2">
                  Xem Đề án Tuyển sinh
                </Link>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  padding: '28px',
                }}
              >
                {/* Admission methods mini-grid */}
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--uni-gold)',
                    marginBottom: 16,
                  }}
                >
                  Các phương thức xét tuyển
                </div>
                <div className="row g-2">
                  {ADMISSION_METHODS.map((m) => (
                    <div className="col-6" key={m.title}>
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '4px',
                          padding: '12px',
                        }}
                      >
                        <div style={{ color: 'var(--uni-gold)', marginBottom: 6 }}>{m.icon}</div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.78rem', lineHeight: 1.3 }}>{m.title}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginTop: 4, lineHeight: 1.4 }}>{m.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="pub-stats-bar">
        <div className="container">
          <div className="row justify-content-center">
            {STATS.map((s) => (
              <div key={s.label} className="col-6 col-md-3">
                <div className="pub-stat-item">
                  <div className="pub-stat-item__num">{s.num}</div>
                  <div className="pub-stat-item__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
              <a href="#" style={{ color: 'var(--uni-primary)', fontWeight: 600 }}>Xem chi tiết &rarr;</a>
            </div>
          </div>

          <div className="row g-4">
            {/* Left — News */}
            <div className="col-lg-8">
              <h2 className="section-heading">Tin tức Tuyển sinh</h2>

              {NEWS.map((item, idx) => (
                <div
                  key={idx}
                  className={`news-card mb-3 ${item.isMain ? '' : ''}`}
                  style={{ padding: item.isMain ? 0 : 0 }}
                >
                  <div className="row g-0">
                    <div className={`${item.isMain ? 'col-md-4' : 'col-md-3'}`}>
                      <div
                        className="news-card__img"
                        style={{ minHeight: item.isMain ? 160 : 110 }}
                      >
                        <div className="text-center px-3" style={{ fontSize: '0.7rem' }}>
                          <FileText size={28} style={{ opacity: 0.3, marginBottom: 4 }} />
                          <div>Ảnh minh họa</div>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div style={{ padding: '14px 16px' }}>
                        <div className="news-card__category">{item.category}</div>
                        <div className={`news-card__title ${item.isMain ? '' : ''}`}>
                          <a href="#" style={{ fontSize: item.isMain ? '1rem' : '0.9rem' }}>
                            {item.title}
                          </a>
                        </div>
                        {item.isMain && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
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

              <a
                href="#"
                className="d-flex align-items-center gap-1"
                style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 8 }}
              >
                Xem tất cả tin tức <ChevronRight size={14} />
              </a>

              {/* Important dates */}
              <div style={{ marginTop: 40 }}>
                <h2 className="section-heading">Mốc thời gian quan trọng</h2>
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}
                >
                  {[
                    { date: '01/03 – 15/05/2026', event: 'Nộp hồ sơ xét học bạ đợt 1', status: 'Đang mở' },
                    { date: '25/05/2026', event: 'Thi Đánh giá năng lực đợt 1 (ĐHQG)', status: 'Sắp tới' },
                    { date: '26/06 – 30/07/2026', event: 'Đăng ký xét tuyển trên hệ thống BGDĐT', status: 'Sắp tới' },
                    { date: '17/08/2026', event: 'Công bố điểm chuẩn tạm thời', status: 'Sắp tới' },
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: i < 3 ? '1px solid var(--border-default)' : 'none',
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          minWidth: 160,
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: 'var(--uni-primary)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {row.date}
                      </div>
                      <div style={{ fontSize: '0.88rem', flexGrow: 1 }}>{row.event}</div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '2px',
                          flexShrink: 0,
                          backgroundColor: row.status === 'Đang mở' ? '#dcfce7' : '#f1f5f9',
                          color: row.status === 'Đang mở' ? '#166534' : '#475569',
                          border: row.status === 'Đang mở' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        }}
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Sidebar */}
            <div className="col-lg-4">
              {/* Quick info */}
              <div className="quick-widget mb-4">
                <div className="quick-widget__header">
                  <BookOpen size={16} />
                  Tra nhanh thông tin
                </div>
                {QUICK_LINKS.map((label) => (
                  <a key={label} href="#" className="quick-widget__item">
                    <span>{label}</span>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </a>
                ))}
              </div>

              {/* Hotline */}
              <div className="hotline-card mb-4">
                <div className="hotline-card__label">Hỗ trợ tuyển sinh</div>
                <div className="hotline-card__number">1900 1234</div>
                <div className="hotline-card__sub">Thứ 2 – Thứ 6: 07:30 – 17:00</div>

                <div
                  style={{
                    marginTop: 16,
                    height: 1,
                    background: 'rgba(255,255,255,0.12)',
                  }}
                />
                <div className="d-flex gap-2 mt-3">
                  <a
                    href="mailto:tuyensinh@daihocabc.edu.vn"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px',
                      borderRadius: '2px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Gửi Email
                  </a>
                  <a
                    href="#"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px',
                      borderRadius: '2px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Chat Zalo
                  </a>
                </div>
              </div>

              {/* CTA register */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderTop: '3px solid var(--uni-secondary)',
                  borderRadius: '6px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <Building2 size={24} style={{ color: 'var(--uni-secondary)', marginBottom: 10 }} />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: 'var(--uni-primary)',
                    marginBottom: 8,
                  }}
                >
                  Sẵn sàng đăng ký?
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
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
