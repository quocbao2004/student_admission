import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Banner Section */}
      <section className="bg-light pb-5 pt-0">
        <div className="py-5" style={{ backgroundColor: 'var(--uni-primary)', color: 'white', borderBottom: '5px solid var(--uni-secondary)' }}>
          <div className="container py-md-5">
            <div className="row align-items-center">
              <div className="col-md-7">
                <span className="badge bg-danger mb-3 px-3 py-2">Tuyển sinh 2026</span>
                <h1 className="display-4 fw-bold text-white mb-4">Chào đón Tân Sinh viên<br/>Khóa 2026</h1>
                <p className="lead mb-4 text-white-50">
                  Nắm bắt cơ hội trúng tuyển vào top các ngành đào tạo chất lượng cao. Khám phá các phương thức xét tuyển và đăng ký ngay hôm nay.
                </p>
                <div className="d-flex gap-3 mt-4">
                  <Link to="/register" className="btn btn-danger btn-lg px-4 d-flex align-items-center gap-2">
                    Đăng ký Hồ sơ ngay <ArrowRight size={20} />
                  </Link>
                  <Link to="#" className="btn btn-outline-light btn-lg px-4">
                    Tra cứu điểm chuẩn
                  </Link>
                </div>
              </div>
              <div className="col-md-5 d-none d-md-block text-center">
                {/* Mockup picture placeholder */}
                <div className="bg-white bg-opacity-10 rounded p-4 border border-light border-opacity-25" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-white-50">[Hình ảnh sinh viên/Trường đại học]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-5">
        <div className="container">
          <div className="row g-5">
            
            {/* Left Column - News */}
            <div className="col-lg-8">
              <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <FileText className="text-danger" /> Tin tức Tuyển sinh mới nhất
              </h3>
              
              <div className="card border-0 mb-4 pb-4 border-bottom">
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="bg-light rounded w-100 h-100 min-vh-25 d-flex align-items-center justify-content-center text-muted">
                      [Ảnh bài báo 1]
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="text-danger small fw-bold mb-2">THÔNG BÁO CHÍNH THỨC</div>
                    <h5 className="fw-bold"><a href="#" className="text-decoration-none">Công bố đề án tuyển sinh chính thức năm 2026 của Đại học ABC</a></h5>
                    <p className="text-muted mt-2">Trường Đại học ABC vừa chính thức công bố công bố quy chế và đề án tuyển sinh năm 2026 với 5 phương thức lấy điểm xét tuyển nhằm mở rộng cơ hội cho thí sinh trên toàn quốc...</p>
                    <div className="d-flex align-items-center gap-2 small text-muted mt-3">
                      <Clock size={14} /> 12/04/2026
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 mb-4 pb-4 border-bottom">
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="bg-light rounded w-100" style={{ height: '120px' }}></div>
                  </div>
                  <div className="col-md-8">
                    <h5 className="fw-bold fs-6"><a href="#" className="text-decoration-none">Hướng dẫn chi tiết các bước nộp minh chứng Học bạ trực tuyến</a></h5>
                    <p className="text-muted small mt-2">Bài viết hướng dẫn các bước chụp ảnh, chuyển đổi đuôi file để cập nhật lên phần mềm đăng ký nguyện vọng.</p>
                    <div className="d-flex align-items-center gap-2 small text-muted mt-2">
                      <Clock size={14} /> 10/04/2026
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Side features */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 mb-4 position-relative overflow-hidden">
                <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', backgroundColor: 'var(--uni-secondary)' }}></div>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3"><BookOpen size={20} className="me-2 text-danger"/> Tra nhanh thông tin</h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-3 border-bottom pb-2"><a href="#" className="text-decoration-none fw-medium">Danh mục ngành đào tạo 2026</a></li>
                    <li className="mb-3 border-bottom pb-2"><a href="#" className="text-decoration-none fw-medium">Công thức & phương thức xét tuyển</a></li>
                    <li className="mb-3 border-bottom pb-2"><a href="#" className="text-decoration-none fw-medium">Quy định về ưu tiên khu vực</a></li>
                    <li><a href="#" className="text-decoration-none fw-medium">Học phí & Học bổng</a></li>
                  </ul>
                </div>
              </div>

              <div className="card border-primary text-center p-4" style={{ backgroundColor: 'rgb(0, 51, 102, 0.03)' }}>
                <h5 className="fw-bold mb-3 text-primary">Cần bộ phận hỗ trợ?</h5>
                <p className="small text-muted mb-4">Các thắc mắc về hồ sơ sẽ được chúng tôi giải đáp sớm nhất qua Hotline hoặc Zalo OA.</p>
                <div className="fs-3 fw-bold text-danger mb-2">1900 1234</div>
                <div className="small fw-medium text-muted">Giờ làm việc: 08:00 - 17:00</div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
