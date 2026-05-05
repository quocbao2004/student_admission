import { Link } from 'react-router-dom';
import {
  ChevronRight, MapPin, Phone, Mail, Clock,
  MessageSquare, HelpCircle,
} from 'lucide-react';
import { useState } from 'react';

const FAQ_DATA = [
  {
    q: 'Hạn cuối đăng ký xét học bạ đợt 1 là khi nào?',
    a: 'Hạn nộp hồ sơ xét học bạ đợt 1 là ngày 15/05/2026. Thí sinh cần hoàn tất tải minh chứng và nộp lệ phí trước thời điểm này.',
  },
  {
    q: 'Tôi có thể đăng ký tối đa bao nhiêu nguyện vọng?',
    a: 'Hệ thống cho phép đăng ký tối đa 3 nguyện vọng. Các nguyện vọng được xét theo thứ tự ưu tiên mà bạn sắp xếp.',
  },
  {
    q: 'Lệ phí xét tuyển là bao nhiêu?',
    a: 'Lệ phí xét tuyển là 30.000đ cho mỗi nguyện vọng. Thanh toán qua VNPay hoặc chuyển khoản trực tiếp.',
  },
  {
    q: 'Sau khi thanh toán, tôi có thể thay đổi nguyện vọng không?',
    a: 'Sau khi thanh toán thành công, nguyện vọng sẽ bị khóa và không thể thay đổi. Vui lòng kiểm tra kỹ trước khi thanh toán.',
  },
  {
    q: 'Kết quả xét tuyển được công bố khi nào?',
    a: 'Kết quả xét tuyển sẽ được công bố trên hệ thống sau khi Hội đồng tuyển sinh hoàn tất quá trình lọc ảo. Thí sinh sẽ nhận thông báo qua email đã đăng ký.',
  },
  {
    q: 'Tôi quên mật khẩu thì phải làm sao?',
    a: 'Hiện tại hệ thống chưa hỗ trợ quên mật khẩu tự động. Vui lòng liên hệ Phòng tuyển sinh qua hotline hoặc email để được hỗ trợ.',
  },
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <section className="py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Trang chủ</Link>
          <ChevronRight size={12} style={{ margin: '0 6px', opacity: 0.5 }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Liên hệ & FAQ</span>
        </nav>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--uni-primary)', marginBottom: 32 }}>
          <MessageSquare size={22} style={{ marginRight: 8, verticalAlign: -3 }} />
          Liên hệ & Câu hỏi thường gặp
        </h1>

        <div className="row g-4">
          {/* Left — Contact Info */}
          <div className="col-lg-5">
            <div className="contact-info-card">
              <h3 className="contact-info-card__title">Phòng Tuyển sinh</h3>
              <p className="contact-info-card__subtitle">Trường Đại học ABC</p>

              <div className="contact-info-card__item">
                <MapPin size={16} style={{ flexShrink: 0, color: 'var(--uni-primary)' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Địa chỉ</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Phòng Đào tạo - Tòa Nhà A1, 123 Đường XYZ, Quận 1, TP. Hồ Chí Minh</div>
                </div>
              </div>

              <div className="contact-info-card__item">
                <Phone size={16} style={{ flexShrink: 0, color: 'var(--uni-primary)' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Hotline</div>
                  <div style={{ color: 'var(--uni-gold)', fontWeight: 800, fontSize: '1.1rem' }}>1900 1234</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Máy lẻ 1 — Phòng Tuyển sinh</div>
                </div>
              </div>

              <div className="contact-info-card__item">
                <Mail size={16} style={{ flexShrink: 0, color: 'var(--uni-primary)' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Email</div>
                  <a href="mailto:tuyensinh@daihocabc.edu.vn" style={{ color: 'var(--uni-primary)' }}>
                    tuyensinh@daihocabc.edu.vn
                  </a>
                </div>
              </div>

              <div className="contact-info-card__item">
                <Clock size={16} style={{ flexShrink: 0, color: 'var(--uni-primary)' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Giờ làm việc</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Thứ 2 – Thứ 6: 07:30 – 17:00</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Nghỉ Thứ 7, Chủ nhật & Lễ</div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div style={{
              marginTop: 16,
              height: 200,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              background: 'var(--color-gray-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
            }}>
              <MapPin size={20} style={{ opacity: 0.3, marginRight: 8 }} />
              Bản đồ sẽ hiển thị tại đây
            </div>
          </div>

          {/* Right — FAQ */}
          <div className="col-lg-7">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                <HelpCircle size={18} style={{ marginRight: 6, verticalAlign: -3, color: 'var(--uni-primary)' }} />
                Câu hỏi thường gặp
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Giải đáp nhanh các thắc mắc phổ biến về quy trình xét tuyển
              </p>
            </div>

            <div className="faq-list">
              {FAQ_DATA.map((faq, idx) => (
                <div key={idx} className={`faq-item ${openFaq === idx ? 'faq-item--open' : ''}`}>
                  <button className="faq-item__question" onClick={() => toggleFaq(idx)}>
                    <span>{faq.q}</span>
                    <ChevronRight
                      size={16}
                      style={{
                        flexShrink: 0,
                        transition: 'transform 0.2s',
                        transform: openFaq === idx ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="faq-item__answer">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 24,
              padding: 20,
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 4 }}>Không tìm thấy câu trả lời?</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 12 }}>
                Liên hệ trực tiếp Phòng tuyển sinh để được giải đáp chi tiết.
              </p>
              <a href="mailto:tuyensinh@daihocabc.edu.vn" className="btn btn-primary btn-sm">
                <Mail size={14} style={{ marginRight: 6 }} /> Gửi email hỏi đáp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
