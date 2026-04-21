import { Wallet, CreditCard } from 'lucide-react';

export default function Payment() {
  return (
    <div>
      <h2 className="mb-4">Thanh toán Lệ phí</h2>
      
      <div className="row g-4">
        <div className="col-md-8">
          <div className="card p-4">
            <h5 className="mb-4">Chi tiết thanh toán</h5>
            <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
              <span className="text-muted">Lệ phí xét tuyển (3 nguyện vọng)</span>
              <span className="fw-medium">60,000 VND</span>
            </div>
            <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
              <span className="text-muted">Phí giao dịch</span>
              <span className="fw-medium">Miễn phí</span>
            </div>
            <div className="d-flex justify-content-between fs-5 fw-bold mt-2">
              <span>Tổng cộng:</span>
              <span className="text-accent">60,000 VND</span>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card p-4">
            <h5 className="mb-4">Phương thức</h5>
            <button className="btn btn-outline-primary w-100 mb-3 d-flex align-items-center justify-content-center gap-2 py-3">
              <Wallet size={20} /> VNPay
            </button>
            <button className="btn btn-outline-primary w-100 mb-3 d-flex align-items-center justify-content-center gap-2 py-3">
              <Wallet size={20} /> MoMo
            </button>
            <button className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 py-3">
              <CreditCard size={20} /> Thẻ tín dụng/Ghi nợ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
