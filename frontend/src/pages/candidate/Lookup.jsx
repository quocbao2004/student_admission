import { Search } from 'lucide-react';

export default function Lookup() {
  return (
    <div>
      <h2 className="mb-4">Tra cứu Điểm chuẩn</h2>
      
      <div className="card p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label small fw-medium">Năm tuyển sinh</label>
            <select className="form-select">
              <option>2023</option>
              <option>2022</option>
              <option>2021</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-medium">Phương thức xét</label>
            <select className="form-select">
              <option>Điểm thi THPT Quốc Gia</option>
              <option>Xét học bạ THPT</option>
              <option>Thi đánh giá năng lực</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-medium">Ngành học</label>
            <input type="text" className="form-control" placeholder="Nhập tên ngành..." />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100 d-flex justify-content-center align-items-center gap-2">
              <Search size={18} /> Lọc
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3">Mã ngành</th>
                <th className="py-3">Tên ngành</th>
                <th className="py-3">Tổ hợp môn</th>
                <th className="py-3 text-end">Điểm chuẩn</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3">IT01</td>
                <td className="py-3 fw-medium">Công nghệ Thông tin</td>
                <td className="py-3">A00, A01, D01</td>
                <td className="py-3 text-end fw-bold text-accent">26.5</td>
              </tr>
              <tr>
                <td className="px-4 py-3">IT02</td>
                <td className="py-3 fw-medium">Khoa học Máy tính</td>
                <td className="py-3">A00, A01</td>
                <td className="py-3 text-end fw-bold text-accent">27.1</td>
              </tr>
              <tr>
                <td className="px-4 py-3">BA01</td>
                <td className="py-3 fw-medium">Quản trị Kinh doanh</td>
                <td className="py-3">A00, A01, D01, C00</td>
                <td className="py-3 text-end fw-bold text-accent">24.0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
