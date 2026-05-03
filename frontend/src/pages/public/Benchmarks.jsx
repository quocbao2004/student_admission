import { Link } from 'react-router-dom';
import {
  ChevronRight, TrendingUp, TrendingDown, ArrowRight,
  BarChart3, AlertCircle, Loader2, Minus,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { usePublicData } from '../../hooks/usePublicData';
import { publicApi } from '../../services/publicApi';

// ─── Sub-components ──────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
      <Loader2
        size={32}
        style={{ opacity: 0.4, marginBottom: 12, animation: 'spin 1s linear infinite' }}
      />
      <div style={{ fontSize: '0.88rem' }}>Đang tải dữ liệu điểm chuẩn...</div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '14px 18px', borderRadius: 'var(--radius-md)',
        background: '#fff5f5', border: '1px solid #fca5a5', color: '#991b1b',
        fontSize: '0.85rem',
      }}
    >
      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{message}</span>
    </div>
  );
}

function EmptyTableRow({ colSpan, text }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontSize: '0.88rem' }}
      >
        {text}
      </td>
    </tr>
  );
}

function TrendCell({ score, prevScore }) {
  if (prevScore == null || score == null) {
    return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  }
  const diff = score - prevScore;
  if (Math.abs(diff) < 0.01) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        <Minus size={12} /> ±0
      </span>
    );
  }
  const isUp = diff > 0;
  const color = isUp ? '#dc2626' : '#16a34a'; // đỏ = tăng (khó hơn), xanh = giảm
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', fontWeight: 700, color }}>
      <Icon size={12} />
      {isUp ? '+' : ''}{diff.toFixed(1)}
    </span>
  );
}

// ─── Year tabs ────────────────────────────────────────────────────────────────

function YearTabs({ years, activeYear, onSelect }) {
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '2px solid var(--border-default)',
        marginBottom: 20,
        gap: 0,
      }}
    >
      {years.map((y) => {
        const isActive = y === activeYear;
        return (
          <button
            key={y}
            onClick={() => onSelect(y)}
            style={{
              padding: '8px 20px',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--uni-primary)' : '2px solid transparent',
              background: 'transparent',
              color: isActive ? 'var(--uni-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              marginBottom: -2,
              transition: 'all 0.15s',
              letterSpacing: 0.3,
            }}
          >
            Năm {y}
          </button>
        );
      })}
    </div>
  );
}

// ─── Method pill filters ──────────────────────────────────────────────────────

function MethodPills({ methods, activeMethod, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
      {['Tất cả', ...methods].map((m) => {
        const isActive = m === activeMethod;
        return (
          <button
            key={m}
            onClick={() => onSelect(m)}
            style={{
              padding: '5px 14px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: 'var(--radius)',
              border: `1px solid ${isActive ? 'var(--uni-primary)' : 'var(--border-strong)'}`,
              background: isActive ? 'var(--uni-primary)' : '#fff',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.12s',
              whiteSpace: 'nowrap',
            }}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Benchmarks() {
  const { data: rawBenchmarks, loading, error } = usePublicData(publicApi.getBenchmarks);

  const [search, setSearch] = useState('');
  const [activeYear, setActiveYear] = useState(null);
  const [activeMethod, setActiveMethod] = useState('Tất cả');

  // Lấy danh sách năm unique, sắp xếp mới → cũ
  const years = useMemo(() => {
    const all = [...new Set((rawBenchmarks ?? []).map((b) => b.year))].sort((a, b) => b - a);
    return all;
  }, [rawBenchmarks]);

  // Năm đang chọn — mặc định năm mới nhất
  const selectedYear = activeYear ?? years[0] ?? null;

  // Danh sách phương thức của năm được chọn
  const methodsForYear = useMemo(() => {
    if (!selectedYear) return [];
    const all = (rawBenchmarks ?? [])
      .filter((b) => b.year === selectedYear)
      .map((b) => b.method);
    return [...new Set(all)].sort();
  }, [rawBenchmarks, selectedYear]);

  // Tìm năm trước để tính xu hướng
  const prevYear = useMemo(() => {
    if (!selectedYear || years.length < 2) return null;
    const idx = years.indexOf(selectedYear);
    return idx < years.length - 1 ? years[idx + 1] : null;
  }, [years, selectedYear]);

  // Map điểm của năm trước để tính xu hướng nhanh
  const prevYearScoreMap = useMemo(() => {
    if (!prevYear || !rawBenchmarks) return {};
    const map = {};
    rawBenchmarks
      .filter((b) => b.year === prevYear)
      .forEach((b) => {
        map[`${b.code}__${b.method}`] = b.score;
      });
    return map;
  }, [rawBenchmarks, prevYear]);

  // Lọc dữ liệu theo năm, phương thức và search
  const filtered = useMemo(() => {
    if (!rawBenchmarks || !selectedYear) return [];
    const q = search.trim().toLowerCase();
    return rawBenchmarks.filter((b) => {
      if (b.year !== selectedYear) return false;
      if (activeMethod !== 'Tất cả' && b.method !== activeMethod) return false;
      if (q && !b.major.toLowerCase().includes(q) && !b.code.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rawBenchmarks, selectedYear, activeMethod, search]);

  const handleYearSelect = (y) => {
    setActiveYear(y);
    setActiveMethod('Tất cả'); // reset method khi đổi năm
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

        {/* Title */}
        <div className="mb-4">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--uni-primary)', marginBottom: 4 }}>
            <BarChart3 size={22} style={{ marginRight: 8, verticalAlign: -3 }} />
            Điểm chuẩn các năm
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Tra cứu điểm chuẩn theo từng năm và từng phương thức xét tuyển.
            Kết quả chỉ mang tính tham khảo.
          </p>
        </div>

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && (
          <>
            {years.length === 0 ? (
              <div
                style={{
                  textAlign: 'center', padding: 64,
                  color: 'var(--text-muted)', fontSize: '0.9rem',
                  border: '1px dashed var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <BarChart3 size={36} style={{ opacity: 0.25, marginBottom: 12 }} />
                <div style={{ fontWeight: 600 }}>Chưa có dữ liệu điểm chuẩn.</div>
                <div style={{ marginTop: 4, fontSize: '0.8rem' }}>
                  Điểm chuẩn sẽ được cập nhật sau khi hoàn tất xét tuyển.
                </div>
              </div>
            ) : (
              <>
                {/* ── Year tabs ── */}
                <YearTabs
                  years={years}
                  activeYear={selectedYear}
                  onSelect={handleYearSelect}
                />

                {/* ── Search + Method pills ── */}
                <div className="row g-3 mb-3 align-items-center">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm theo tên hoặc mã ngành..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="col-md-8">
                    <MethodPills
                      methods={methodsForYear}
                      activeMethod={activeMethod}
                      onSelect={setActiveMethod}
                    />
                  </div>
                </div>

                {/* ── Summary bar ── */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '8px 14px', marginBottom: 12,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.78rem', color: 'var(--text-secondary)',
                  }}
                >
                  <span>
                    Năm xét tuyển: <strong style={{ color: 'var(--uni-primary)' }}>{selectedYear}</strong>
                  </span>
                  <span style={{ width: 1, height: 14, background: 'var(--border-default)' }} />
                  <span>
                    Phương thức:{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {activeMethod}
                    </strong>
                  </span>
                  <span style={{ width: 1, height: 14, background: 'var(--border-default)' }} />
                  <span>
                    Kết quả: <strong>{filtered.length}</strong> ngành
                  </span>
                  {prevYear && (
                    <>
                      <span style={{ width: 1, height: 14, background: 'var(--border-default)' }} />
                      <span>So sánh với: <strong>{prevYear}</strong></span>
                    </>
                  )}
                </div>

                {/* ── Table ── */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <table
                    className="table table-hover align-middle mb-0"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: 'var(--uni-primary)', color: '#fff' }}>
                        <th style={thStyle}>STT</th>
                        <th style={thStyle}>Mã ngành</th>
                        <th style={thStyle}>Tên ngành</th>
                        <th style={thStyle}>Phương thức</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>
                          Điểm chuẩn {selectedYear}
                        </th>
                        {prevYear && (
                          <th style={{ ...thStyle, textAlign: 'right' }}>
                            {prevYear}
                          </th>
                        )}
                        {prevYear && (
                          <th style={{ ...thStyle, textAlign: 'right' }}>Xu hướng</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <EmptyTableRow
                          colSpan={prevYear ? 7 : 5}
                          text="Không có dữ liệu điểm chuẩn phù hợp với bộ lọc đã chọn."
                        />
                      ) : (
                        filtered.map((row, idx) => {
                          const prevScore = prevYearScoreMap[`${row.code}__${row.method}`] ?? null;
                          return (
                            <tr key={`${row.code}-${row.method}-${idx}`}>
                              <td style={tdStyle('#9ba3af')}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td style={tdStyle('var(--uni-primary)', true)}>
                                {row.code}
                              </td>
                              <td style={{ ...tdStyle(), fontWeight: 600 }}>
                                {row.major}
                              </td>
                              <td style={{ ...tdStyle(), color: 'var(--text-secondary)' }}>
                                {row.method}
                              </td>
                              <td
                                style={{
                                  ...tdStyle('var(--uni-primary)', true),
                                  textAlign: 'right',
                                  fontSize: '0.95rem',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {row.score}
                              </td>
                              {prevYear && (
                                <td
                                  style={{
                                    ...tdStyle(),
                                    textAlign: 'right',
                                    color: 'var(--text-muted)',
                                    fontVariantNumeric: 'tabular-nums',
                                  }}
                                >
                                  {prevScore ?? '—'}
                                </td>
                              )}
                              {prevYear && (
                                <td style={{ ...tdStyle(), textAlign: 'right' }}>
                                  <TrendCell score={row.score} prevScore={prevScore} />
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Note ── */}
                <div
                  style={{
                    marginTop: 12,
                    padding: '8px 14px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.78rem',
                    color: '#92400e',
                  }}
                >
                  ⚠️ Điểm chuẩn chỉ mang tính tham khảo. Kết quả chính thức phụ thuộc vào chỉ tiêu và số lượng thí sinh từng năm.
                </div>
              </>
            )}
          </>
        )}

        {/* CTA */}
        {!loading && !error && (
          <div className="text-center mt-5">
            <Link
              to="/register"
              className="btn btn-danger d-flex align-items-center gap-2 mx-auto"
              style={{ width: 'fit-content' }}
            >
              Đăng ký xét tuyển ngay <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const thStyle = { padding: '11px 14px', fontWeight: 700, fontSize: '0.78rem', letterSpacing: 0.3 };

function tdStyle(color, bold = false) {
  return {
    padding: '10px 14px',
    color: color ?? 'inherit',
    fontWeight: bold ? 700 : 400,
  };
}
