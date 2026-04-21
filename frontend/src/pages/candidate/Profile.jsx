import { Upload } from 'lucide-react';

export default function Profile() {
  return (
    <div>
      <h2 className="mb-4">Hồ sơ cá nhân</h2>
      
      <div className="card p-4 mb-4">
        <h5 className="mb-4">Thông tin cơ bản</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-medium">Họ và tên</label>
            <input type="text" className="form-control" defaultValue="Nguyễn Văn A" />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">CCCD/CMND</label>
            <input type="text" className="form-control" defaultValue="001203004567" disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">Email</label>
            <input type="email" className="form-control" defaultValue="nva@example.com" />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">Số điện thoại</label>
            <input type="text" className="form-control" defaultValue="0901234567" />
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h5 className="mb-4">Minh chứng (Ảnh học bạ / CCCD)</h5>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="border rounded p-4 text-center border-dashed" style={{ borderStyle: 'dashed' }}>
              <Upload className="text-muted mb-2" size={24} />
              <div className="fw-medium mb-1">Mặt trước CCCD</div>
              <div className="text-muted small">Chấp nhận JPG, PNG (Tối đa 5MB)</div>
              <button className="btn btn-outline-primary btn-sm mt-3">Chọn file</button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="border rounded p-4 text-center border-dashed" style={{ borderStyle: 'dashed' }}>
              <Upload className="text-muted mb-2" size={24} />
              <div className="fw-medium mb-1">Ảnh Học bạ (Trang điểm)</div>
              <div className="text-muted small">Chấp nhận JPG, PNG (Tối đa 5MB)</div>
              <button className="btn btn-outline-primary btn-sm mt-3">Chọn file</button>
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-end mt-4 pt-3 border-top">
          <button className="btn btn-primary px-4">Lưu hồ sơ</button>
        </div>
      </div>
    </div>
  );
}
