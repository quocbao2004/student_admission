import { Link } from 'react-router-dom';
import {
  BookOpen, ChevronRight, Search, Users,
  ArrowRight, Building2, AlertCircle, Loader2,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { usePublicData } from '../../hooks/usePublicData';
import { publicApi } from '../../services/publicApi';

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
      <Loader2 size={32} style={{ opacity: 0.4, marginBottom: 12, animation: 'spin 1s linear infinite' }} />
      <div style={{ fontSize: '0.88rem' }}>Đang tải danh sách ngành...</div>
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

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
      <Building2 size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Không tìm thấy ngành phù hợp</div>
    </div>
  );
}

function MajorCard({ major }) {
  return (
    <div className="major-card">
      <div className="major-card__header">
        <div>
          <span className="major-card__code">{major.code}</span>
          <h3 className="major-card__name">{major.name}</h3>
        </div>
      </div>
      {major.description && (
        <p className="major-card__desc">{major.description}</p>
      )}
      <div className="major-card__footer">
        <div className="major-card__meta">
          <Users size={13} /> Chỉ tiêu: <strong>{major.quota}</strong>
        </div>
        {major.combinations.length > 0 && (
          <div className="major-card__combos">
            {major.combinations.map((c) => (
              <span key={c} className="major-card__combo-tag">{c}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Majors() {
  const { data: majors, loading, error } = usePublicData(publicApi.getMajors);

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!majors) return [];
    if (!search.trim()) return majors;
    const q = search.toLowerCase();
    return majors.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q),
    );
  }, [majors, search]);

  const totalQuota = useMemo(
    () => (majors ?? []).reduce((s, m) => s + (m.quota || 0), 0),
    [majors],
  );

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
              Danh mục Ngành đào tạo
            </h1>
            {!loading && !error && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                {majors?.length ?? 0} ngành — Tổng chỉ tiêu:{' '}
                <strong>{totalQuota.toLocaleString('vi-VN')}</strong> sinh viên
              </p>
            )}
          </div>
          <div className="col-auto">
            <Link to="/register" className="btn btn-danger d-flex align-items-center gap-2">
              Đăng ký ngay <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Search */}
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
        </div>

        {/* Content */}
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && filtered.length === 0 && <EmptyState />}
        {!loading && !error && filtered.length > 0 && (
          <div className="row g-3">
            {filtered.map((m) => (
              <div className="col-md-6" key={m.id}>
                <MajorCard major={m} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
