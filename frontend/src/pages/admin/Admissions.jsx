import { Target, Download, Play } from 'lucide-react';

export default function Admissions() {
  return (
    <div>
      <h2 className="mb-4">Chạy lọc ảo & Xét tuyển</h2>
      
      <div className="card p-4 border-accent mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-1">Hệ thống Lọc ảo (Mô phỏng)</h5>
            <p className="text-muted small mb-0">Thuật toán sẽ duyệt qua tất cả nguyện vọng theo thứ tự ưu tiên và chỉ tiêu của từng ngành.</p>
          </div>
          <button className="btn btn-accent bg-accent text-white px-4 py-2 d-flex align-items-center gap-2" style={{ backgroundColor: 'var(--accent)' }}>
            <Play size={18} /> Bắt đầu chạy
          </button>
        </div>
      </div>

      <h5 className="mb-3">Kết quả dự kiến (Sau khi chạy)</h5>
      <div className="card">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3">Mã ngành</th>
                <th className="py-3">Chỉ tiêu</th>
                <th className="py-3">Đã trúng tuyển</th>
                <th className="py-3">Điểm chuẩn dự kiến</th>
                <th className="px-4 py-3 text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 fw-medium">IT01</td>
                <td className="py-3">800</td>
                <td className="py-3 text-success fw-bold">800</td>
                <td className="py-3 fw-bold text-accent">26.50</td>
                <td className="px-4 py-3 text-end">
                  <button className="btn btn-light btn-sm d-flex align-items-center justify-content-center gap-1 ms-auto border">
                    <Download size={14} /> Xuất Excel
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 fw-medium">BA01</td>
                <td className="py-3">1200</td>
                <td className="py-3 text-warning fw-bold">1150</td>
                <td className="py-3 fw-bold text-accent">24.00</td>
                <td className="px-4 py-3 text-end">
                  <button className="btn btn-light btn-sm d-flex align-items-center justify-content-center gap-1 ms-auto border">
                    <Download size={14} /> Xuất Excel
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
