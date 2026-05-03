import { Link } from 'react-router-dom';
import {
  BookOpen, ChevronRight, Search, Users,
  ArrowRight, Building2,
} from 'lucide-react';
import { useState } from 'react';

const MAJORS_DATA = [
  { code: 'IT01', name: 'Công nghệ Thông tin', quota: 500, group: 'Công nghệ', combinations: ['A00', 'A01', 'D01'], description: 'Đào tạo kỹ sư CNTT có khả năng phân tích, thiết kế và phát triển các hệ thống phần mềm, ứng dụng trí tuệ nhân tạo.' },
  { code: 'IT02', name: 'Khoa học Máy tính', quota: 120, group: 'Công nghệ', combinations: ['A00', 'A01'], description: 'Nghiên cứu nền tảng khoa học của máy tính, thuật toán, cấu trúc dữ liệu và lý thuyết tính toán.' },
  { code: 'IT03', name: 'Kỹ thuật Phần mềm', quota: 200, group: 'Công nghệ', combinations: ['A00', 'A01', 'D01'], description: 'Chuyên sâu về quy trình phát triển phần mềm chuyên nghiệp, kiểm thử và quản lý dự án.' },
  { code: 'IT04', name: 'An toàn Thông tin', quota: 80, group: 'Công nghệ', combinations: ['A00', 'A01'], description: 'Bảo mật hệ thống, mạng máy tính, phân tích mã độc và phòng chống tấn công mạng.' },
  { code: 'BA01', name: 'Quản trị Kinh doanh', quota: 300, group: 'Kinh tế', combinations: ['A00', 'A01', 'D01'], description: 'Đào tạo nhà quản trị có tư duy chiến lược, khả năng lãnh đạo và vận hành doanh nghiệp hiệu quả.' },
  { code: 'BA02', name: 'Tài chính – Ngân hàng', quota: 200, group: 'Kinh tế', combinations: ['A00', 'D01'], description: 'Chuyên gia phân tích tài chính, đầu tư, quản lý rủi ro cho ngân hàng và tổ chức tài chính.' },
  { code: 'BA03', name: 'Kế toán', quota: 150, group: 'Kinh tế', combinations: ['A00', 'D01'], description: 'Nghiệp vụ kế toán, kiểm toán, thuế và quản lý tài chính doanh nghiệp theo chuẩn quốc tế.' },
  { code: 'EN01', name: 'Ngôn ngữ Anh', quota: 180, group: 'Ngôn ngữ', combinations: ['D01', 'D14', 'D15'], description: 'Sử dụng thành thạo tiếng Anh trong giao tiếp, dịch thuật, giảng dạy và kinh doanh quốc tế.' },
  { code: 'EN02', name: 'Ngôn ngữ Trung Quốc', quota: 80, group: 'Ngôn ngữ', combinations: ['D01', 'D04'], description: 'Đào tạo cử nhân tiếng Trung với năng lực giao tiếp, biên phiên dịch chuyên nghiệp.' },
  { code: 'LA01', name: 'Luật Kinh tế', quota: 120, group: 'Xã hội', combinations: ['A00', 'C00', 'D01'], description: 'Pháp luật kinh doanh, thương mại, đầu tư và giải quyết tranh chấp thương mại.' },
  { code: 'ME01', name: 'Kỹ thuật Điện – Điện tử', quota: 150, group: 'Kỹ thuật', combinations: ['A00', 'A01'], description: 'Thiết kế, vận hành hệ thống điện, điện tử công nghiệp và tự động hóa sản xuất.' },
  { code: 'ME02', name: 'Kỹ thuật Cơ khí', quota: 100, group: 'Kỹ thuật', combinations: ['A00', 'A01'], description: 'Thiết kế, chế tạo máy móc và quản lý sản xuất công nghiệp hiện đại.' },
];

const GROUPS = ['Tất cả', 'Công nghệ', 'Kinh tế', 'Ngôn ngữ', 'Xã hội', 'Kỹ thuật'];

export default function Majors() {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('Tất cả');

  const filtered = MAJORS_DATA.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase());
    const matchGroup = activeGroup === 'Tất cả' || m.group === activeGroup;
    return matchSearch && matchGroup;
  });

  return (
    <section className="py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Trang chủ</Link>
          <ChevronRight size={12} style={{ margin: '0 6px', opacity: 0.5 }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Ngành đào tạo</span>
        </nav>

        <div className="row align-items-end mb-4">
          <div className="col">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--uni-primary)', marginBottom: 4 }}>
              <BookOpen size={22} style={{ marginRight: 8, verticalAlign: -3 }} />
              Danh mục Ngành đào tạo 2026
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              {MAJORS_DATA.length} ngành — Tổng chỉ tiêu: {MAJORS_DATA.reduce((s, m) => s + m.quota, 0).toLocaleString()} sinh viên
            </p>
          </div>
          <div className="col-auto">
            <Link to="/register" className="btn btn-danger d-flex align-items-center gap-2">
              Đăng ký ngay <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Search + filter */}
        <div className="row g-3 mb-4">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text"><Search size={16} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm ngành theo tên hoặc mã ngành..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-7 d-flex flex-wrap gap-2 align-items-center">
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`btn btn-sm ${activeGroup === g ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ fontSize: '0.78rem', fontWeight: 600 }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            <Building2 size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Không tìm thấy ngành phù hợp</div>
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map((m) => (
              <div className="col-md-6" key={m.code}>
                <div className="major-card">
                  <div className="major-card__header">
                    <div>
                      <span className="major-card__code">{m.code}</span>
                      <h3 className="major-card__name">{m.name}</h3>
                    </div>
                    <span className="major-card__group">{m.group}</span>
                  </div>
                  <p className="major-card__desc">{m.description}</p>
                  <div className="major-card__footer">
                    <div className="major-card__meta">
                      <Users size={13} /> Chỉ tiêu: <strong>{m.quota}</strong>
                    </div>
                    <div className="major-card__combos">
                      {m.combinations.map((c) => (
                        <span key={c} className="major-card__combo-tag">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
