import { Link } from 'react-router-dom';
import {
  ChevronRight, Award, BookOpen, GraduationCap,
  Shield, ArrowRight, AlertCircle, Loader2,
} from 'lucide-react';
import { usePublicData } from '../../hooks/usePublicData';
import { publicApi } from '../../services/publicApi';

// Icon mapping theo thứ tự phương thức phổ biến — fallback khi DB không có icon
const METHOD_ICONS = [Award, BookOpen, GraduationCap, Shield];

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
      <Loader2 size={32} style={{ opacity: 0.4, marginBottom: 12, animation: 'spin 1s linear infinite' }} />
      <div style={{ fontSize: '0.88rem' }}>Đang tải thông tin phương thức xét tuyển...</div>
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

function MethodCard({ method, index }) {
  const Icon = METHOD_ICONS[index % METHOD_ICONS.length];
  return (
    <div className="method-card">
      <div className="method-card__header">
        <div className="method-card__icon-wrap">
          <Icon size={22} />
        </div>
        <div>
          <h3 className="method-card__title">{method.name}</h3>
        </div>
      </div>
      {method.description && (
        <p className="method-card__desc">{method.description}</p>
      )}
      <div className="method-card__footer">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Phương thức #{index + 1}
        </span>
        <Link to="/register" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
          Đăng ký <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function Methods() {
  const { data: methods, loading, error } = usePublicData(publicApi.getMethods);

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
            Phương thức Xét tuyển
          </h1>
          {!loading && !error && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 600, lineHeight: 1.7 }}>
              Nhà trường áp dụng{' '}
              <strong>{methods?.length ?? 0} phương thức xét tuyển</strong> song song,
              thí sinh có thể đăng ký nhiều phương thức để tối đa hóa cơ hội trúng tuyển.
            </p>
          )}
        </div>

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && (
          <>
            {methods?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Chưa có thông tin phương thức xét tuyển.
              </div>
            ) : (
              <div className="row g-4">
                {(methods ?? []).map((m, idx) => (
                  <div className="col-md-6" key={m.id}>
                    <MethodCard method={m} index={idx} />
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="text-center mt-5">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                Bạn chưa biết phương thức nào phù hợp? Hãy xem danh mục ngành trước.
              </p>
              <Link to="/majors" className="btn btn-primary d-flex align-items-center gap-2 mx-auto" style={{ width: 'fit-content' }}>
                Xem danh mục ngành đào tạo <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
