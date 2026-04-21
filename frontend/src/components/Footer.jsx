import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto py-5 text-white" style={{ backgroundColor: 'var(--uni-primary)' }}>
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <h5 className="text-white fw-bold mb-3 text-uppercase">Trường Đại học ABC</h5>
            <p className="small mb-4 text-white-50" style={{ maxWidth: '400px' }}>
              Trường Đại học ABC tự hào là cơ sở giáo dục chất lượng cao, tiền đề đào tạo nguồn nhân lực cốt lõi cho sự phát triển của đất nước.
            </p>
          </div>
          <div className="col-md-4">
            <h6 className="text-white fw-bold mb-3 text-uppercase">Liên hệ Tuyển sinh</h6>
            <ul className="list-unstyled small text-white-50">
              <li className="mb-2 d-flex gap-2 align-items-start">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>Phòng Đào tạo - Tòa A1, 123 Đường XYZ, Quận 1, TP. HCM.</span>
              </li>
              <li className="mb-2 d-flex gap-2">
                <Phone size={16} /> 1900 1234 (Máy lẻ 1)
              </li>
              <li className="mb-2 d-flex gap-2">
                <Mail size={16} /> tuyensinh@abc.edu.vn
              </li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="text-white fw-bold mb-3 text-uppercase">Liên kết nhanh</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Cổng thông tin sinh viên</a></li>
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Trang chủ chính thức</a></li>
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Hỏi đáp tuyển sinh</a></li>
            </ul>
          </div>
        </div>
        <hr className="my-4 border-light opacity-25" />
        <div className="text-center small text-white-50">
          &copy; {new Date().getFullYear()} Trường Đại học ABC. Bản quyền thuộc về Phòng Đào tạo & Tuyển sinh.
        </div>
      </div>
    </footer>
  );
}
