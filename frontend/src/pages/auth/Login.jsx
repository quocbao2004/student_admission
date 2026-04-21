import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
      const response = await fetch('http://localhost:8000/api/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error('Sai email hoặc mật khẩu!');
      }

      // Truyền cả 2 tokens vào AuthContext, sẽ tự gọi /me/ để lấy full user data
      await login(data.access, data.refresh);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white text-center py-4 border-bottom-0 pb-0">
              <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                <LogIn size={32} color="var(--uni-primary)" />
              </div>
              <h4 className="fw-bold mb-1">Đăng nhập</h4>
              <p className="text-muted small">Dành cho Thí sinh & Cán bộ Tuyển sinh</p>
            </div>
            
            <div className="card-body p-4 p-md-5 pt-0">
              {error && <div className="alert alert-danger small">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium small">Email đăng nhập</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted"/></span>
                    <input 
                      type="email" className="form-control border-start-0 ps-0" placeholder="vidu@email.com" 
                      value={email} onChange={(e) => setEmail(e.target.value)} required 
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-medium small mb-0">Mật khẩu</label>
                    <a href="#" className="small text-decoration-none">Quên mật khẩu?</a>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted"/></span>
                    <input 
                      type="password" className="form-control border-start-0 ps-0" placeholder="••••••••" 
                      value={password} onChange={(e) => setPassword(e.target.value)} required 
                    />
                  </div>
                </div>
                
                <button type="submit" disabled={loading} className="btn btn-primary w-100 py-2 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2">
                  {loading ? 'Đang xử lý...' : <><LogIn size={18} /> Xác thực đăng nhập</>}
                </button>
                
                <div className="text-center small mt-4">
                  <span className="text-muted">Thí sinh chưa có tài khoản? </span>
                  <Link to="/register" className="fw-bold">Đăng ký ngay</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
