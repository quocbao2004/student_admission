import { Save } from 'lucide-react';

export default function Formulas() {
  return (
    <div>
      <h2 className="mb-4">Thiết lập Công thức Xét tuyển</h2>
      
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card p-4 h-100">
            <h5 className="mb-4 text-accent">Xét tuyển Học bạ</h5>
            <div className="mb-3">
              <label className="form-label small fw-medium">Công thức cơ bản</label>
              <div className="p-3 bg-light border rounded font-monospace small">
                Điểm Xét = (Môn 1 + Môn 2 + Môn 3) + Điểm ưu tiên
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label small fw-medium">Hệ số môn chính (nếu có)</label>
              <select className="form-select">
                <option>Không nhân hệ số</option>
                <option>Môn 1 (Toán) x 2</option>
                <option>Môn 3 (Anh) x 2</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Điểm làm tròn</label>
              <select className="form-select">
                <option>2 chữ số thập phân (VD: 25.45)</option>
                <option>1 chữ số thập phân (VD: 25.5)</option>
              </select>
            </div>
            <button className="btn btn-primary mt-auto d-flex align-items-center justify-content-center gap-2">
              <Save size={18} /> Lưu thiết lập
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-4 h-100 opacity-75">
            <h5 className="mb-4 text-muted">Xét tuyển THPT Quốc gia</h5>
            <div className="mb-3">
              <label className="form-label small fw-medium">Công thức</label>
              <div className="p-3 bg-light border rounded font-monospace small">
                Tương tự quy chế Bộ GD&ĐT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
