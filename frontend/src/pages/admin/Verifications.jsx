import { Check, X, Search } from 'lucide-react';

export default function Verifications() {
  return (
    <div className="h-100 d-flex flex-column">
      <h2 className="mb-4 flex-shrink-0">Duyệt hồ sơ (Split-view)</h2>
      
      <div className="row flex-grow-1 min-vh-0 gap-0">
        {/* Cột trái: Danh sách và thông tin nhập */}
        <div className="col-md-5 d-flex flex-column pe-3 border-end">
          <div className="mb-3 d-flex gap-2">
            <input type="text" className="form-control" placeholder="Tìm tên, CCCD..." />
            <button className="btn btn-light border"><Search size={20} /></button>
          </div>
          
          <div className="card mb-3 bg-light border-accent">
            <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-medium">Nguyễn Văn A</div>
                <div className="small text-muted">001203004567</div>
              </div>
              <span className="badge bg-warning bg-opacity-10 text-warning px-2 py-1 rounded">Cần duyệt</span>
            </div>
          </div>
          <div className="card mb-3 opacity-50">
            <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-medium">Trần Thị B</div>
                <div className="small text-muted">002203004568</div>
              </div>
              <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded">Đã duyệt</span>
            </div>
          </div>

          <hr />
          
          <div className="overflow-auto pe-2 flex-grow-1">
            <h6 className="fw-bold mb-3">Thông tin thí sinh nhập:</h6>
            <div className="mb-2">
              <div className="small text-muted">Toán</div>
              <div className="fw-medium border-bottom pb-1">8.5</div>
            </div>
            <div className="mb-2">
              <div className="small text-muted">Vật lý</div>
              <div className="fw-medium border-bottom pb-1">9.0</div>
            </div>
            <div className="mb-2">
              <div className="small text-muted">Hóa học</div>
              <div className="fw-medium border-bottom pb-1">8.0</div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <button className="btn btn-success flex-grow-1 d-flex align-items-center justify-content-center gap-1">
                <Check size={18} /> Hợp lệ
              </button>
              <button className="btn btn-danger flex-grow-1 d-flex align-items-center justify-content-center gap-1">
                <X size={18} /> Sai thông tin
              </button>
            </div>
          </div>
        </div>

        {/* Cột phải: Hình ảnh minh chứng */}
        <div className="col-md-7 ps-4 d-flex flex-column h-100">
          <div className="bg-light rounded d-flex flex-column align-items-center justify-content-center flex-grow-1 border">
            <span className="text-muted mb-2">Ảnh Học bạ</span>
            <div className="bg-white border rounded shadow-sm d-flex align-items-center justify-content-center" style={{ width: '80%', height: '60%', borderStyle: 'dashed' }}>
              <span className="text-muted small">[Mockup Image: Học bạ Toán 8.5, Lý 9.0, Hóa 8.0]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
