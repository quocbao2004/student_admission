import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/accounts/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
      }

      await login(data.access, data.refresh);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" style={{ marginBottom: 24 }}>
          <ol className="breadcrumb" style={{ fontSize: '0.8rem' }}>
            <li className="breadcrumb-item">
              <Link to="/" style={{ color: 'var(--uni-primary)' }}>Trang chủ</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">Đăng nhập</li>
          </ol>
        </nav>

        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="auth-card">
              {/* Card Header */}
              <div className="auth-card__header">
                <div className="auth-card__header-icon">
                  <ShieldCheck size={22} color="rgba(255,255,255,0.9)" />
                </div>
                <div>
                  <div className="auth-card__title">Đăng nhập</div>
                  <div className="auth-card__subtitle">
                    Cổng Tuyển sinh &bull; Đại học ABC
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="auth-card__body">
                {error && (
                  <div className="alert alert-danger d-flex align-items-start gap-2 mb-4" role="alert">
                    <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="login-email" className="form-label">
                      Email đăng nhập
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Mail size={16} />
                      </span>
                      <input
                        id="login-email"
                        type="email"
                        className="form-control"
                        placeholder="vidu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label htmlFor="login-password" className="form-label mb-0">
                        Mật khẩu
                      </label>
                      <a
                        href="#"
                        style={{ fontSize: '0.8rem', color: 'var(--uni-primary)', fontWeight: 500 }}
                      >
                        Quên mật khẩu?
                      </a>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Lock size={16} />
                      </span>
                      <input
                        id="login-password"
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-login-submit"
                    disabled={loading}
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    style={{ padding: '10px' }}
                  >
                    {loading ? (
                      <span>Đang xác thực...</span>
                    ) : (
                      <>
                        <LogIn size={16} />
                        Đăng nhập hệ thống
                      </>
                    )}
                  </button>
                </form>

                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: '1px solid var(--border-default)',
                    textAlign: 'center',
                    fontSize: '0.82rem',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Thí sinh chưa có tài khoản?</span>{' '}
                  <Link to="/register" style={{ fontWeight: 700, color: 'var(--uni-secondary)' }}>
                    Đăng ký hồ sơ ngay
                  </Link>
                </div>
              </div>
            </div>

            {/* Help note */}
            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                background: '#fff',
                border: '1px solid var(--border-default)',
                borderLeft: '3px solid var(--uni-gold)',
                borderRadius: '4px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>Lưu ý:</strong> Tài khoản đăng nhập là địa chỉ <strong>email</strong> đã đăng ký. Liên hệ Hotline <strong>1900 1234</strong> nếu cần hỗ trợ.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
