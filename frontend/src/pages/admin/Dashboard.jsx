import { Users, BookOpen, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="mb-4">Tổng quan Hệ thống</h2>
      
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card p-4">
            <div className="text-muted small mb-2 d-flex align-items-center gap-2">
              <BookOpen size={16} /> Tổng chỉ tiêu
            </div>
            <div className="fs-3 fw-bold">5,000</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-4">
            <div className="text-muted small mb-2 d-flex align-items-center gap-2">
              <Users size={16} /> Số hồ sơ nộp
            </div>
            <div className="fs-3 fw-bold">12,450</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-4">
            <div className="text-muted small mb-2 d-flex align-items-center gap-2">
              <CheckCircle size={16} /> Hồ sơ đã duyệt
            </div>
            <div className="fs-3 fw-bold text-success">8,230</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-4">
            <div className="text-muted small mb-2">Tỷ lệ chọi trung bình</div>
            <div className="fs-3 fw-bold text-accent">1 : 2.5</div>
          </div>
        </div>
      </div>
    </div>
  );
}
