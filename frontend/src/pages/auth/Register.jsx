import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus, Mail, Lock, User, CreditCard, Phone,
  ShieldCheck, Info, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';

const API_REGISTER = 'http://localhost:8000/api/accounts/register/';

// -------------------------------------------------------------------
// Danh sách mã tỉnh/thành phố hợp lệ (3 chữ số đầu của CCCD 11 số)
// Format CCCD 11 số: [3 số mã tỉnh][1 số giới tính+thế kỷ][2 số năm sinh][5 số thứ tự]
// -------------------------------------------------------------------
const VALID_PROVINCE_CODES = new Set([
  '001','002','004','006','008','010','011','012','014','015',
  '017','019','020','022','024','025','026','027','030','031',
  '033','034','035','036','037','038','040','042','044','045',
  '046','048','049','051','052','054','056','058','060','062',
  '064','066','067','068','070','072','074','075','077','079',
  '080','082','083','084','086','087','089','091','092','093',
  '094','095','096',
]);

/**
 * Kiểm tra tính hợp lệ của số CCCD 11 chữ số (Việt Nam).
 * Trả về object: { valid: boolean, reason: string }
 */
function validateCCCDNumber(value) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: null, reason: '' };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, reason: 'Chỉ được nhập chữ số (0–9).' };
  }
  if (trimmed.length < 11) {
    return { valid: false, reason: `Cần thêm ${11 - trimmed.length} chữ số nữa.` };
  }
  if (trimmed.length > 11) {
    return { valid: false, reason: 'Vượt quá 11 chữ số.' };
  }

  const provinceCode = trimmed.slice(0, 3);
  if (!VALID_PROVINCE_CODES.has(provinceCode)) {
    return { valid: false, reason: `Mã tỉnh/thành "${provinceCode}" không hợp lệ.` };
  }

  const genderCenturyDigit = parseInt(trimmed[3], 10);
  if (genderCenturyDigit < 0 || genderCenturyDigit > 3) {
    return { valid: false, reason: 'Chữ số thứ 4 phải từ 0–3 (mã giới tính & thế kỷ).' };
  }

  return { valid: true, reason: 'Số CCCD hợp lệ.' };
}

// -------------------------------------------------------------------
// Các trường form thông thường (không phải CCCD)
// -------------------------------------------------------------------
const STANDARD_FIELDS = [
  {
    name: 'full_name',
    label: 'Họ và tên thí sinh',
    type: 'text',
    placeholder: 'Nguyễn Văn A',
    icon: <User size={16} />,
    col: 'col-sm-6',
    required: true,
  },
  {
    name: 'email',
    label: 'Email (Tên đăng nhập)',
    type: 'email',
    placeholder: 'vidu@email.com',
    icon: <Mail size={16} />,
    col: 'col-sm-6',
    required: true,
  },
  {
    name: 'phone',
    label: 'Số điện thoại',
    type: 'tel',
    placeholder: '0901234567',
    icon: <Phone size={16} />,
    col: 'col-sm-6',
    required: true,
    maxLength: 10,
    minLength: 10,
    pattern: '^0[35789]\\d{8}$',
    title: 'Số điện thoại phải 10 số và đúng đầu mạng VN.',
  },
];

// -------------------------------------------------------------------
// Component badge trạng thái CCCD
// -------------------------------------------------------------------
function CccdStatusBadge({ status }) {
  if (status.valid === null) return null;

  const config = status.valid
    ? { icon: <CheckCircle2 size={13} />, color: '#166534', bg: '#dcfce7', border: '#bbf7d0' }
    : { icon: <XCircle size={13} />, color: '#991b1b', bg: '#fef2f2', border: '#fecaca' };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
        padding: '4px 10px',
        borderRadius: '3px',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: 1.4,
      }}
      role="status"
      aria-live="polite"
    >
      {config.icon}
      <span>{status.reason}</span>
    </div>
  );
}

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------
export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    cccd: '',
    email: '',
    phone: '',
    password: '',
  });
  const [cccdStatus, setCccdStatus] = useState({ valid: null, reason: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'cccd') {
      setCccdStatus(validateCCCDNumber(value));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Guard: không cho submit nếu CCCD chưa hợp lệ
    const cccdCheck = validateCCCDNumber(formData.cccd);
    if (!cccdCheck.valid) {
      setCccdStatus(cccdCheck);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      }

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Border color cho input CCCD
  const cccdBorderColor =
    cccdStatus.valid === true
      ? '#16a34a'
      : cccdStatus.valid === false
      ? '#dc2626'
      : undefined;

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 32 }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" style={{ marginBottom: 24 }}>
          <ol className="breadcrumb" style={{ fontSize: '0.8rem' }}>
            <li className="breadcrumb-item">
              <Link to="/" style={{ color: 'var(--uni-primary)' }}>Trang chủ</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">Đăng ký hồ sơ</li>
          </ol>
        </nav>

        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="auth-card">
              {/* Card Header */}
              <div className="auth-card__header">
                <div className="auth-card__header-icon">
                  <UserPlus size={22} color="rgba(255,255,255,0.9)" />
                </div>
                <div>
                  <div className="auth-card__title">Đăng ký hồ sơ Thí sinh</div>
                  <div className="auth-card__subtitle">
                    Cổng Tuyển sinh &bull; Đại học ABC &bull; Năm học 2026
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="auth-card__body">
                {/* Instruction notice */}
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '10px 14px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderLeft: '3px solid var(--uni-primary)',
                    borderRadius: '4px',
                    marginBottom: 20,
                    fontSize: '0.8rem',
                    color: '#1e40af',
                    lineHeight: 1.5,
                  }}
                >
                  <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    Vui lòng nhập đúng thông tin cá nhân theo <strong>CMND/CCCD</strong>. Thông tin này sẽ được sử dụng xuyên suốt quá trình xét tuyển.
                  </span>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-start gap-2 mb-4" role="alert">
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Row 1: Họ tên + CCCD (tách riêng để có thể render CCCD validator) */}
                  <div className="row g-3 mb-3">
                    {/* Họ và tên */}
                    <div className="col-sm-6">
                      <label htmlFor="reg-full_name" className="form-label">
                        Họ và tên thí sinh
                      </label>
                      <div className="input-group">
                        <span className="input-group-text"><User size={16} /></span>
                        <input
                          id="reg-full_name"
                          type="text"
                          name="full_name"
                          className="form-control"
                          placeholder="Nguyễn Văn A"
                          value={formData.full_name}
                          onChange={handleChange}
                          required
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    {/* CCCD — có validator riêng */}
                    <div className="col-sm-6">
                      <label htmlFor="reg-cccd" className="form-label">
                        Số CMND / CCCD
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <CreditCard size={16} />
                        </span>
                        <input
                          id="reg-cccd"
                          type="text"
                          name="cccd"
                          className="form-control"
                          placeholder="01234567890"
                          value={formData.cccd}
                          onChange={handleChange}
                          required
                          maxLength={11}
                          inputMode="numeric"
                          autoComplete="off"
                          style={cccdBorderColor ? { borderColor: cccdBorderColor } : undefined}
                          aria-describedby="cccd-status"
                        />
                        {/* Trailing icon trạng thái */}
                        {cccdStatus.valid !== null && (
                          <span
                            className="input-group-text"
                            style={{
                              backgroundColor: cccdStatus.valid ? '#dcfce7' : '#fef2f2',
                              borderColor: cccdStatus.valid ? '#16a34a' : '#dc2626',
                              color: cccdStatus.valid ? '#16a34a' : '#dc2626',
                            }}
                          >
                            {cccdStatus.valid
                              ? <CheckCircle2 size={16} />
                              : <XCircle size={16} />
                            }
                          </span>
                        )}
                      </div>

                      {/* Feedback message */}
                      <div id="cccd-status">
                        <CccdStatusBadge status={cccdStatus} />
                      </div>

                      {/* Progress bar (chỉ hiển thị khi đang nhập, chưa đủ 11 số) */}
                      {cccdStatus.valid === false && formData.cccd.length > 0 && formData.cccd.length < 11 && (
                        <div style={{ marginTop: 6 }}>
                          <div
                            style={{
                              height: 3,
                              backgroundColor: '#fee2e2',
                              borderRadius: 2,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${(formData.cccd.length / 11) * 100}%`,
                                backgroundColor: formData.cccd.length >= 8 ? '#f59e0b' : '#ef4444',
                                borderRadius: 2,
                                transition: 'width 0.15s ease',
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              marginTop: 3,
                              textAlign: 'right',
                            }}
                          >
                            {formData.cccd.length}/11 chữ số
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Email + SĐT */}
                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label htmlFor="reg-email" className="form-label">
                        Email (Tên đăng nhập)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text"><Mail size={16} /></span>
                        <input
                          id="reg-email"
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="vidu@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <label htmlFor="reg-phone" className="form-label">
                        Số điện thoại
                      </label>
                      <div className="input-group">
                        <span className="input-group-text"><Phone size={16} /></span>
                        <input
                          id="reg-phone"
                          type="tel"
                          name="phone"
                          className="form-control"
                          placeholder="0901234567"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          maxLength={10}
                          minLength={10}
                          pattern="^0[35789]\d{8}$"
                          title="Số điện thoại phải 10 số và đúng đầu mạng VN."
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label htmlFor="reg-password" className="form-label">
                      Tạo mật khẩu
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Lock size={16} />
                      </span>
                      <input
                        id="reg-password"
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Ít nhất 8 ký tự"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Mật khẩu tối thiểu 8 ký tự, nên có chữ hoa, số và ký tự đặc biệt.
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-register-submit"
                    disabled={loading || cccdStatus.valid === false}
                    className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
                    style={{ padding: '10px' }}
                  >
                    {loading ? (
                      <span>Đang xử lý...</span>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Tạo tài khoản Thí sinh
                      </>
                    )}
                  </button>

                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 14,
                      borderTop: '1px solid var(--border-default)',
                      textAlign: 'center',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>Đã có tài khoản?</span>{' '}
                    <Link to="/login" style={{ fontWeight: 700, color: 'var(--uni-primary)' }}>
                      Đăng nhập
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            {/* Policy note */}
            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                background: '#fff',
                border: '1px solid var(--border-default)',
                borderLeft: '3px solid var(--uni-gold)',
                borderRadius: '4px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              Khi đăng ký, bạn đồng ý với{' '}
              <a href="#" style={{ color: 'var(--uni-primary)', fontWeight: 600 }}>
                Điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="#" style={{ color: 'var(--uni-primary)', fontWeight: 600 }}>
                Chính sách bảo mật
              </a>{' '}
              của Trường Đại học ABC.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
