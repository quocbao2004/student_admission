import { Plus, GripVertical, Trash2 } from 'lucide-react';

export default function Aspirations() {
  const aspirations = [
    { id: 1, major: 'Công nghệ Thông tin', block: 'A00 (Toán, Lý, Hóa)', method: 'Xét điểm thi THPTQG' },
    { id: 2, major: 'Khoa học Máy tính', block: 'A01 (Toán, Lý, Anh)', method: 'Xét học bạ' },
    { id: 3, major: 'Kỹ thuật Phần mềm', block: 'A00 (Toán, Lý, Hóa)', method: 'Xét điểm đánh giá năng lực' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Đăng ký Nguyện vọng</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2">
          <Plus size={18} /> Thêm nguyện vọng
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3" style={{ width: '60px' }}>TT</th>
                <th className="py-3">Ngành học</th>
                <th className="py-3">Tổ hợp môn</th>
                <th className="py-3">Phương thức xét</th>
                <th className="px-4 py-3 text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {aspirations.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 fw-bold text-muted">
                    <span className="d-flex align-items-center gap-2">
                      <GripVertical size={16} className="text-light-muted" style={{ cursor: 'grab' }} />
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 fw-medium">{item.major}</td>
                  <td className="py-3 text-secondary">{item.block}</td>
                  <td className="py-3 text-secondary">{item.method}</td>
                  <td className="px-4 py-3 text-end">
                    <button className="btn btn-light btn-sm text-danger border-0">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="alert alert-info mt-4 d-flex align-items-center gap-2">
        <span className="fw-medium">Lưu ý:</span> Bạn có thể kéo thả biểu tượng <GripVertical size={16}/> để thay đổi thứ tự ưu tiên của nguyện vọng.
      </div>
    </div>
  );
}
