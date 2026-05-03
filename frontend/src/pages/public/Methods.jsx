import { Link } from 'react-router-dom';
import {
  ChevronRight, Award, BookOpen, GraduationCap,
  Shield, CheckCircle2, ArrowRight,
} from 'lucide-react';

const METHODS = [
  {
    id: 1,
    icon: Award,
    title: 'Xét kết quả thi THPT Quốc gia',
    percent: '40%',
    desc: 'Căn cứ vào kết quả thi tốt nghiệp THPT Quốc gia năm 2026, thí sinh đăng ký nguyện vọng xét tuyển theo tổ hợp môn phù hợp.',
    requirements: [
      'Đã tốt nghiệp THPT hoặc tương đương',
      'Có kết quả thi tốt nghiệp THPT năm 2026',
      'Điểm tổ hợp xét tuyển ≥ 15 điểm (chưa tính ưu tiên)',
    ],
    timeline: 'Tháng 7 – Tháng 8/2026',
  },
  {
    id: 2,
    icon: BookOpen,
    title: 'Xét học bạ THPT',
    percent: '30%',
    desc: 'Xét tuyển dựa trên điểm trung bình các môn trong tổ hợp xét tuyển của 5 hoặc 6 học kỳ cấp THPT.',
    requirements: [
      'Học sinh lớp 12 hoặc đã tốt nghiệp THPT',
      'Điểm trung bình tổ hợp ≥ 6.0 (mỗi môn ≥ 5.0)',
      'Hạnh kiểm từ Khá trở lên suốt 3 năm THPT',
    ],
    timeline: 'Tháng 3 – Tháng 5/2026',
  },
  {
    id: 3,
    icon: GraduationCap,
    title: 'Xét kết quả thi ĐGNL / ĐGTD',
    percent: '20%',
    desc: 'Sử dụng kết quả thi Đánh giá năng lực (HSA/APT) của ĐHQG TP.HCM hoặc ĐHQG Hà Nội, hoặc kết quả IELTS/SAT.',
    requirements: [
      'Có kết quả thi ĐGNL còn hiệu lực (trong 2 năm)',
      'Điểm ĐGNL ≥ 700/1200 (HSA) hoặc ≥ 80/150 (APT)',
      'Hoặc: IELTS ≥ 5.5, SAT ≥ 1100 (tùy ngành)',
    ],
    timeline: 'Tháng 5 – Tháng 7/2026',
  },
  {
    id: 4,
    icon: Shield,
    title: 'Xét tuyển thẳng',
    percent: '10%',
    desc: 'Dành cho thí sinh đạt giải cấp Quốc gia, Quốc tế trong các kỳ thi Học sinh giỏi hoặc các cuộc thi KHKT cấp quốc gia.',
    requirements: [
      'Đạt giải Nhất, Nhì, Ba kỳ thi HSG Quốc gia',
      'Đạt giải Olympic quốc tế hoặc khu vực',
      'Hoàn thành hồ sơ đầy đủ theo quy định',
    ],
    timeline: 'Tháng 1 – Tháng 4/2026',
  },
];

export default function Methods() {
  return (
    <section className="py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Trang chủ</Link>
          <ChevronRight size={12} style={{ margin: '0 6px', opacity: 0.5 }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Phương thức xét tuyển</span>
        </nav>

        <div className="mb-5">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--uni-primary)', marginBottom: 8 }}>
            Phương thức Xét tuyển 2026
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 600, lineHeight: 1.7 }}>
            Trường Đại học ABC áp dụng <strong>4 phương thức xét tuyển</strong> song song,
            thí sinh có thể đăng ký nhiều phương thức để tối đa hóa cơ hội trúng tuyển.
          </p>
        </div>

        <div className="row g-4">
          {METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <div className="col-md-6" key={m.id}>
                <div className="method-card">
                  <div className="method-card__header">
                    <div className="method-card__icon-wrap">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="method-card__title">{m.title}</h3>
                      <span className="method-card__percent">Chiếm {m.percent} chỉ tiêu</span>
                    </div>
                  </div>
                  <p className="method-card__desc">{m.desc}</p>

                  <div className="method-card__section-label">Điều kiện xét tuyển</div>
                  <ul className="method-card__list">
                    {m.requirements.map((r, i) => (
                      <li key={i}>
                        <CheckCircle2 size={14} style={{ color: 'var(--uni-primary)', flexShrink: 0, marginTop: 2 }} />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="method-card__footer">
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      ⏱ {m.timeline}
                    </span>
                    <Link to="/register" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                      Đăng ký <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-5">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
            Bạn chưa biết phương thức nào phù hợp? Hãy xem danh mục ngành trước.
          </p>
          <Link to="/majors" className="btn btn-primary d-flex align-items-center gap-2 mx-auto" style={{ width: 'fit-content' }}>
            Xem danh mục ngành đào tạo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
