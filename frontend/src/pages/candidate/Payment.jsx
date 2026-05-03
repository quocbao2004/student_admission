import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle, Loader, ExternalLink, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmissionFlow } from '../../contexts/AdmissionFlowContext';

const API_BASE = 'http://localhost:8000/api';

export default function Payment() {
  const { token, logout } = useAuth();
  const { updateCompletion } = useAdmissionFlow();
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');

  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.status === 401) {
      logout();
      throw new Error('Phiên đăng nhập hết hạn.');
    }
    return res;
  };

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/admissions/payments/status/`);
      const data = await res.json();
      setSummary(data);
      updateCompletion({ hasPaid: Boolean(data?.is_paid) });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handlePayment = async () => {
    try {
      setInitializing(true);
      setError(null);
      const res = await authFetch(`${API_BASE}/admissions/payments/init/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: paymentMethod }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Lỗi khởi tạo thanh toán');
      
      // Chuyển hướng sang cổng thanh toán
      window.location.href = data.pay_url;
    } catch (err) {
      setError(err.message);
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Loader className="spin-icon text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-5">
        <div className="bg-primary-subtle d-inline-flex p-3 rounded-circle mb-3">
          <CreditCard size={32} className="text-primary" />
        </div>
        <h2 className="fw-bold">Thanh toán Lệ phí Xét tuyển</h2>
        <p className="text-muted">Hoàn tất lệ phí để hồ sơ của bạn được chính thức ghi nhận.</p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {summary?.is_paid ? (
        <div className="card border-success shadow-sm text-center p-5">
          <div className="mb-3">
            <CheckCircle size={64} className="text-success" />
          </div>
          <h3 className="fw-bold text-success">Thanh toán thành công!</h3>
          <p className="text-muted mb-4">
            Hệ thống đã nhận được lệ phí cho <strong>{summary.app_count} nguyện vọng</strong> của bạn.<br/>
            Hồ sơ của bạn hiện đã được chuyển sang trạng thái chờ xét tuyển.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-outline-success px-4" onClick={() => window.print()}>
              In biên lai
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-md-7">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-bold">Tóm tắt lệ phí</h6>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush mb-4">
                  <li className="list-group-item d-flex justify-content-between px-0 py-3">
                    <span className="text-muted">Số nguyện vọng đăng ký:</span>
                    <span className="fw-bold">{summary?.app_count || 0}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between px-0 py-3">
                    <span className="text-muted">Lệ phí mỗi nguyện vọng:</span>
                    <span className="fw-bold">{(summary?.fee_per_app || 30000).toLocaleString()}đ</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between px-0 py-3 border-top-0 pt-0">
                    <h5 className="mb-0 fw-bold text-primary">Tổng cộng:</h5>
                    <h5 className="mb-0 fw-bold text-primary">{(summary?.total_amount || 0).toLocaleString()}đ</h5>
                  </li>
                </ul>

                <div className="bg-info-subtle p-3 rounded mb-4 d-flex gap-3">
                  <Info size={24} className="text-info flex-shrink-0" />
                  <div className="small text-info-emphasis">
                    <strong>Lưu ý:</strong> Sau khi thanh toán, bạn sẽ không thể chỉnh sửa thứ tự nguyện vọng hoặc ngành đã chọn. Vui lòng kiểm tra kỹ trước khi tiến hành.
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <div className="mb-2">
                    <label className="form-label small fw-semibold mb-2">Cổng thanh toán</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="paymentMethodVnpay"
                          value="VNPAY"
                          checked={true}
                          readOnly
                        />
                        <label className="form-check-label" htmlFor="paymentMethodVnpay">VNPay (Thẻ ATM, QR, Ngân hàng)</label>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                    disabled={initializing || (summary?.app_count === 0) || summary?.profile_status !== 'VERIFIED'}
                    onClick={handlePayment}
                  >
                    {initializing ? <Loader className="spin-icon" size={20} /> : <ExternalLink size={20} />}
                    Thanh toán qua VNPay
                  </button>
                  <p className="text-center extra-small text-muted mt-2">
                    (Bạn sẽ được chuyển hướng sang cổng thanh toán VNPay)
                  </p>
                  {summary?.profile_status !== 'VERIFIED' && (
                    <p className="text-danger small text-center mb-0">
                      Hồ sơ cần được duyệt trước khi thanh toán lệ phí.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="card border-0 bg-light h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Quy trình nộp lệ phí</h6>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex gap-3 align-items-start">
                    <div className="badge bg-primary rounded-circle p-2" style={{width: '24px', height: '24px'}}>1</div>
                    <div className="small">Kiểm tra lại toàn bộ danh sách nguyện vọng tại mục <strong>"Đăng ký Nguyện vọng"</strong>.</div>
                  </div>
                  <div className="d-flex gap-3 align-items-start">
                    <div className="badge bg-primary rounded-circle p-2" style={{width: '24px', height: '24px'}}>2</div>
                    <div className="small">Xác nhận tổng số tiền cần nộp.</div>
                  </div>
                  <div className="d-flex gap-3 align-items-start">
                    <div className="badge bg-primary rounded-circle p-2" style={{width: '24px', height: '24px'}}>3</div>
                    <div className="small">Thanh toán qua cổng VNPay (App ngân hàng hoặc thẻ ATM).</div>
                  </div>
                  <div className="d-flex gap-3 align-items-start">
                    <div className="badge bg-primary rounded-circle p-2" style={{width: '24px', height: '24px'}}>4</div>
                    <div className="small">Hệ thống sẽ tự động chuyển hướng về trang này sau khi hoàn tất.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bg-primary-subtle { background-color: rgba(var(--bs-primary-rgb), 0.1); }
        .bg-info-subtle { background-color: rgba(var(--bs-info-rgb), 0.1); }
        .extra-small { font-size: 0.75rem; }
      `}</style>
    </div>
  );
}
