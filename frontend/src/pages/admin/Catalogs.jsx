import { Plus } from 'lucide-react';

export default function Catalogs() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý Danh mục</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2">
          <Plus size={18} /> Thêm ngành mới
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3">Mã ngành</th>
                <th className="py-3">Tên ngành</th>
                <th className="py-3">Chỉ tiêu</th>
                <th className="py-3">Tổ hợp đăng ký</th>
                <th className="px-4 py-3 text-end">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 fw-medium">IT01</td>
                <td className="py-3">Công nghệ Thông tin</td>
                <td className="py-3">800</td>
                <td className="py-3 text-muted">A00, A01, D01</td>
                <td className="px-4 py-3 text-end"><span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded">Hoạt động</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 fw-medium">IT02</td>
                <td className="py-3">Khoa học Máy tính</td>
                <td className="py-3">300</td>
                <td className="py-3 text-muted">A00, A01</td>
                <td className="px-4 py-3 text-end"><span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded">Hoạt động</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 fw-medium">BA01</td>
                <td className="py-3">Quản trị Kinh doanh</td>
                <td className="py-3">1200</td>
                <td className="py-3 text-muted">A00, A01, D01, C00</td>
                <td className="px-4 py-3 text-end"><span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1 rounded">Tạm ngưng</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
