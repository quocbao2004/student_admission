import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    cccd: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/accounts/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Quy trình đăng ký lỗi, vui lòng kiểm tra lại thông tin.');
      }
      
      // Đăng ký thành công, chuyển tới login
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white text-center py-4 border-bottom-0 pb-0">
              <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-danger" style={{ width: '64px', height: '64px' }}>
                <UserPlus size={32} />
              </div>
              <h4 className="fw-bold mb-1">Đăng ký Hồ sơ</h4>
              <p className="text-muted small">Khởi tạo tài khoản Thí sinh xét tuyển 2026</p>
            </div>
            
            <div className="card-body p-4 p-md-5 pt-0">
              {error && <div className="alert alert-danger small">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label fw-medium small">Họ và tên thí sinh</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><User size={18} className="text-muted"/></span>
                      <input 
                        type="text" name="full_name" className="form-control border-start-0 ps-0" placeholder="Nguyễn Văn A" 
                        value={formData.full_name} onChange={handleChange} required 
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-medium small">Số CMND / CCCD</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><CheckCircle2 size={18} className="text-muted"/></span>
                      <input 
                        type="text" name="cccd" className="form-control border-start-0 ps-0" placeholder="00120300..." 
                        value={formData.cccd} onChange={handleChange} required 
                        maxLength={12} minLength={12} pattern="^0\d{11}$" title="CCCD phải gồm 12 số (Bắt đầu bằng số 0)"
                      />
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label fw-medium small">Email (Tên đăng nhập)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted"/></span>
                      <input 
                        type="email" name="email" className="form-control border-start-0 ps-0" placeholder="vidu@email.com" 
                        value={formData.email} onChange={handleChange} required 
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-medium small">Số điện thoại</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><span className="text-muted">📞</span></span>
                      <input 
                        type="tel" name="phone" className="form-control border-start-0 ps-0" placeholder="0901234567" 
                        value={formData.phone} onChange={handleChange} required 
                        maxLength={10} minLength={10} pattern="^0[35789]\d{8}$" title="Số điện thoại phải 10 số và đúng đầu mạng VN."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-medium small mb-1">Tạo mật khẩu</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted"/></span>
                    <input 
                      type="password" name="password" className="form-control border-start-0 ps-0" placeholder="Ít nhất 8 ký tự" 
                      value={formData.password} onChange={handleChange} required minLength={8}
                    />
                  </div>
                </div>
                
                <button type="submit" disabled={loading} className="btn btn-danger w-100 py-2 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2">
                  {loading ? 'Đang xử lý...' : <><UserPlus size={18} /> Đồng ý và Tạo tài khoản</>}
                </button>
                
                <div className="text-center small mt-4">
                  <span className="text-muted">Đã có tài khoản chưa? </span>
                  <Link to="/login" className="fw-bold">Đăng nhập</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
