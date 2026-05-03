import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, ArrowRight, BarChart3 } from 'lucide-react';
import { useState, useMemo } from 'react';

const BENCHMARK_DATA = [
  { major: 'Công nghệ Thông tin', code: 'IT01', y2024: 26.5, y2025: 27.0, y2026: null, combo: 'A00', method: 'Xét điểm THPT' },
  { major: 'Công nghệ Thông tin', code: 'IT01', y2024: 7.2, y2025: 7.5, y2026: null, combo: 'A00', method: 'Xét học bạ' },
  { major: 'Khoa học Máy tính', code: 'IT02', y2024: 27.0, y2025: 27.5, y2026: null, combo: 'A00', method: 'Xét điểm THPT' },
  { major: 'Kỹ thuật Phần mềm', code: 'IT03', y2024: 25.5, y2025: 26.0, y2026: null, combo: 'A00', method: 'Xét điểm THPT' },
  { major: 'Kỹ thuật Phần mềm', code: 'IT03', y2024: 7.0, y2025: 7.3, y2026: null, combo: 'A01', method: 'Xét học bạ' },
  { major: 'An toàn Thông tin', code: 'IT04', y2024: 25.0, y2025: 25.5, y2026: null, combo: 'A00', method: 'Xét điểm THPT' },
  { major: 'Quản trị Kinh doanh', code: 'BA01', y2024: 24.0, y2025: 24.5, y2026: null, combo: 'A00', method: 'Xét điểm THPT' },
  { major: 'Quản trị Kinh doanh', code: 'BA01', y2024: 6.8, y2025: 7.0, y2026: null, combo: 'D01', method: 'Xét học bạ' },
  { major: 'Tài chính – Ngân hàng', code: 'BA02', y2024: 23.5, y2025: 24.0, y2026: null, combo: 'A00', method: 'Xét điểm THPT' },
  { major: 'Kế toán', code: 'BA03', y2024: 22.0, y2025: 22.5, y2026: null, combo: 'A00', method: 'Xét điểm THPT' },
  { major: 'Ngôn ngữ Anh', code: 'EN01', y2024: 25.0, y2025: 25.5, y2026: null, combo: 'D01', method: 'Xét điểm THPT' },
  { major: 'Luật Kinh tế', code: 'LA01', y2024: 23.0, y2025: 23.5, y2026: null, combo: 'C00', method: 'Xét điểm THPT' },
  { major: 'Kỹ thuật Điện – Điện tử', code: 'ME01', y2024: 22.5, y2025: 23.0, y2026: null, combo: 'A00', method: 'Xét điểm THPT' },
  { major: 'Kỹ thuật Cơ khí', code: 'ME02', y2024: 21.0, y2025: 21.5, y2026: null, combo: 'A00', method: 'Xét điểm THPT' },
];

export default function Benchmarks() {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('Tất cả');

  const methods = useMemo(() => {
    const unique = [...new Set(BENCHMARK_DATA.map((b) => b.method))];
    return ['Tất cả', ...unique];
  }, []);

  const filtered = useMemo(() => {
    return BENCHMARK_DATA.filter((b) => {
      const matchSearch = b.major.toLowerCase().includes(search.toLowerCase()) || b.code.toLowerCase().includes(search.toLowerCase());
      const matchMethod = methodFilter === 'Tất cả' || b.method === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [search, methodFilter]);

  const renderTrend = (y24, y25) => {
    if (y24 === null || y25 === null) return null;
    const diff = y25 - y24;
    const color = diff > 0 ? '#dc2626' : diff < 0 ? '#16a34a' : 'var(--text-muted)';
    const sign = diff > 0 ? '+' : '';
    return (
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color, marginLeft: 4 }}>
        {sign}{diff.toFixed(1)}
      </span>
    );
  };

  return (
    <section className="py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Trang chủ</Link>
          <ChevronRight size={12} style={{ margin: '0 6px', opacity: 0.5 }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Điểm chuẩn</span>
        </nav>

        <div className="mb-4">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--uni-primary)', marginBottom: 4 }}>
            <BarChart3 size={22} style={{ marginRight: 8, verticalAlign: -3 }} />
            Điểm chuẩn các năm
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Dữ liệu điểm chuẩn tham khảo từ 2024–2025. Điểm chuẩn năm 2026 sẽ được công bố sau khi hoàn tất xét tuyển.
          </p>
        </div>

        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo tên ngành hoặc mã ngành..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-8 d-flex flex-wrap gap-2 align-items-center">
            {methods.map((m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`btn btn-sm ${methodFilter === m ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ fontSize: '0.78rem', fontWeight: 600 }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--uni-primary)', color: '#fff' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem', letterSpacing: 0.3 }}>Mã ngành</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>Tên ngành</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>Phương thức</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>Tổ hợp</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem', textAlign: 'right' }}>2024</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem', textAlign: 'right' }}>2025</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem', textAlign: 'right' }}>Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                filtered.map((b, i) => (
                  <tr key={i}>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--uni-primary)' }}>{b.code}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>{b.major}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{b.method}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                        borderRadius: 2, background: 'var(--bg-subtle)', color: 'var(--text-secondary)',
                        border: '1px solid var(--border-default)',
                      }}>{b.combo}</span>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {b.y2024 ?? '—'}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--uni-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {b.y2025 ?? '—'}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <TrendingUp size={13} style={{ opacity: 0.4 }} />
                      {renderTrend(b.y2024, b.y2025)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-5">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
            Điểm chuẩn chỉ mang tính tham khảo. Kết quả xét tuyển chính thức phụ thuộc vào chỉ tiêu từng năm.
          </p>
          <Link to="/register" className="btn btn-danger d-flex align-items-center gap-2 mx-auto" style={{ width: 'fit-content' }}>
            Đăng ký xét tuyển ngay <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
