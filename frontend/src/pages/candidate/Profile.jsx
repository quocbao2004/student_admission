import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Save, FileText, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmissionFlow } from '../../contexts/AdmissionFlowContext';
import { API_BASE, DOCUMENT_TYPE_LABELS } from '../../config';
import ScoreVerificationFlow from '../../components/ScoreVerificationFlow';

// -------------------------------------------------------------------
// Hằng số giới hạn tuổi theo quy định tuyển sinh đại học
// -------------------------------------------------------------------
const MIN_AGE = 17; // Tối thiểu: đã tốt nghiệp THPT
const MAX_AGE = 60; // Tối đa: giới hạn hợp lý cho hệ chính quy

/**
 * Tính tuổi đầy đủ tính đến ngày hôm nay.
 * @param {string} dobStr - chuỗi YYYY-MM-DD
 * @returns {number}
 */
function calcAge(dobStr) {
  const today = new Date();
  const dob = new Date(dobStr);
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

/**
 * Validate ngày sinh theo quy định tuổi tuyển sinh.
 * @param {string} dobStr - chuỗi YYYY-MM-DD
 * @returns {{ valid: boolean | null, message: string }}
 */
function validateDob(dobStr) {
  if (!dobStr) return { valid: null, message: '' };

  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) {
    return { valid: false, message: 'Ngày sinh không hợp lệ.' };
  }
  if (dob >= new Date()) {
    return { valid: false, message: 'Ngày sinh không thể là ngày trong tương lai.' };
  }

  const age = calcAge(dobStr);
  if (age < MIN_AGE) {
    return {
      valid: false,
      message: `Thí sinh phải đủ ${MIN_AGE} tuổi (sinh trước ${new Date(new Date().setFullYear(new Date().getFullYear() - MIN_AGE + 1)).toLocaleDateString('vi-VN')}).`,
    };
  }
  if (age > MAX_AGE) {
    return { valid: false, message: `Tuổi thí sinh không được vượt quá ${MAX_AGE} tuổi.` };
  }

  return { valid: true, message: `Hợp lệ — ${age} tuổi.` };
}

const StatusBadge = ({ status }) => {
  const map = {
    DRAFT: { label: 'Nháp', cls: 'bg-secondary text-white' },
    PENDING_VERIFY: { label: 'Chờ duyệt', cls: 'bg-warning text-dark' },
    PENDING: { label: 'Chờ duyệt', cls: 'bg-warning text-dark' },
    VERIFIED: { label: 'Đã xác minh', cls: 'bg-success text-white' },
    REJECTED: { label: 'Từ chối', cls: 'bg-danger text-white' },
    PAID: { label: 'Đã thanh toán', cls: 'bg-info text-dark' },
    RANKED: { label: 'Đã xếp hạng', cls: 'bg-primary text-white' },
    RESULT_PUBLISHED: { label: 'Đã công bố kết quả', cls: 'bg-dark text-white' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'bg-secondary text-white' };
  return <span className={`badge ${cls}`}>{label}</span>;
};

function useAuthFetch() {
  const { token, logout } = useAuth();
  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 401) {
      logout();
      throw new Error('Phiên đăng nhập hết hạn.');
    }
    return res;
  };
  return authFetch;
}

/** Kiểm tra profile đã đủ thông tin bắt buộc chưa. */
function isProfileComplete(data) {
  return Boolean(data?.dob && data?.gender && data?.address);
}

export default function Profile() {
  const { user } = useAuth();
  const authFetch = useAuthFetch();
  const { updateCompletion } = useAdmissionFlow();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ dob: '', gender: '', address: '', priority_area: '', priority_object: '' });
  const [dobValidation, setDobValidation] = useState({ valid: null, message: '' });
  const [documents, setDocuments] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState('CCCD');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null); // { type: 'success'|'error', message }
  const [uploadAlert, setUploadAlert] = useState(null);

  const isVerified = profile?.status === 'VERIFIED';

  // Required docs for CCCD + graduation cert (NOT academic record — handled by ScoreVerificationFlow)
  const OTHER_REQUIRED_DOCS = [
    { type: 'CCCD',            label: 'Căn cước công dân (Mặt trước & sau)' },
    { type: 'GRADUATION_CERT', label: 'Bằng tốt nghiệp THPT (Hoặc giấy chứng nhận tạm thời)' },
  ];

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch(`${API_BASE}/admissions/profile/me/`);
        const data = await res.json();
        if (res.ok) {
          setProfile(data);
          const loadedDob = data.dob || '';
          setFormData({
            dob: loadedDob,
            gender: data.gender || '',
            address: data.address || '',
            priority_area: data.priority_area || '',
            priority_object: data.priority_object || '',
          });
          if (loadedDob) setDobValidation(validateDob(loadedDob));
          // Báo cáo trạng thái hoàn thành cho flow
          updateCompletion({ 
            hasProfile: isProfileComplete(data),
            isVerified: data.status === 'VERIFIED'
          });
        }
      } catch (err) {
        console.error('Lỗi tải hồ sơ:', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Load documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await authFetch(`${API_BASE}/admissions/documents/`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        }
      } catch (err) {
        console.error('Lỗi tải tài liệu:', err);
      }
    };
    fetchDocs();
  }, []);



  const handleDobChange = useCallback((e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, dob: value }));
    setDobValidation(validateDob(value));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Guard: không cho lưu nếu ngày sinh chưa hợp lệ
    const dobCheck = validateDob(formData.dob);
    if (!dobCheck.valid) {
      setDobValidation(dobCheck);
      setProfileAlert({ type: 'error', message: 'Vui lòng kiểm tra lại ngày sinh trước khi lưu.' });
      return;
    }

    setSavingProfile(true);
    setProfileAlert(null);
    try {
      const res = await authFetch(`${API_BASE}/admissions/profile/me/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      setProfile(data);
      updateCompletion({ 
        hasProfile: isProfileComplete(data),
        isVerified: data.status === 'VERIFIED'
      });
      setProfileAlert({ type: 'success', message: 'Cập nhật hồ sơ thành công!' });
    } catch (err) {
      setProfileAlert({ type: 'error', message: 'Cập nhật thất bại. Vui lòng thử lại.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveScores = async () => {
    if (scores.some(s => !s.subject || s.score === '')) {
      setScoreAlert({ type: 'error', message: 'Vui lòng điền đầy đủ Tên môn và Điểm số.' });
      return;
    }
    setSavingScores(true);
    setScoreAlert(null);
    try {
      const res = await authFetch(`${API_BASE}/admissions/profile/scores/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scores.map(s => ({ subject: s.subject, score: parseFloat(s.score) })))
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      setScores(data.map(s => ({ subject: s.subject, score: s.score })));
      setScoreAlert({ type: 'success', message: 'Lưu bảng điểm thành công!' });
      setTimeout(() => setScoreAlert(null), 3000);
    } catch (err) {
      setScoreAlert({ type: 'error', message: 'Lưu điểm thất bại. Vui lòng kiểm tra lại định dạng điểm số.' });
    } finally {
      setSavingScores(false);
    }
  };

  const addScoreRow = () => setScores([...scores, { subject: '', score: '' }]);
  const updateScoreRow = (idx, field, val) => {
    const newScores = [...scores];
    newScores[idx][field] = val;
    setScores(newScores);
  };
  const removeScoreRow = (idx) => setScores(scores.filter((_, i) => i !== idx));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setPendingFiles(prev => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingFile = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickUpload = async (docType, files) => {
    if (!files || files.length === 0) return;
    setUploadingDoc(true);
    setUploadAlert(null);
    
    const fd = new FormData();
    fd.append('doc_type', docType);
    Array.from(files).forEach(file => {
      fd.append('files', file);
    });

    try {
      const res = await authFetch(`${API_BASE}/admissions/documents/`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.files?.[0] || data.doc_type?.[0] || data.error || 'Tải lên thất bại.';
        throw new Error(msg);
      }
      setDocuments((prev) => [...data, ...prev]);
      setUploadAlert({ type: 'success', message: `Đã tải lên minh chứng cho "${DOCUMENT_TYPE_LABELS[docType]}" thành công!` });
    } catch (err) {
      setUploadAlert({ type: 'error', message: err.message });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleBulkUpload = async () => {
    if (pendingFiles.length === 0) return;
    setUploadingDoc(true);
    setUploadAlert(null);
    
    const fd = new FormData();
    fd.append('doc_type', selectedDocType);
    pendingFiles.forEach(file => {
      fd.append('files', file);
    });

    try {
      const res = await authFetch(`${API_BASE}/admissions/documents/`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.files?.[0] || data.doc_type?.[0] || data.error || 'Tải lên thất bại.';
        throw new Error(msg);
      }
      setDocuments((prev) => [...data, ...prev]);
      setUploadAlert({ type: 'success', message: `Đã tải lên ${data.length} minh chứng thành công!` });
      setPendingFiles([]);
    } catch (err) {
      setUploadAlert({ type: 'error', message: err.message });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Xác nhận xoá tài liệu này?')) return;
    try {
      const res = await authFetch(`${API_BASE}/admissions/documents/${docId}/`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      }
    } catch (err) {
      alert('Xoá tài liệu thất bại.');
    }
  };

  if (loadingProfile) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Loader className="spin-icon text-primary" size={32} />
        <span className="ms-3 text-muted">Đang tải hồ sơ...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-1 fw-bold">Hồ sơ cá nhân</h2>
      <p className="text-muted small mb-4">Cập nhật thông tin và tải lên các giấy tờ minh chứng cần thiết.</p>

      {/* ========== PHẦN THÔNG TIN CƠ BẢN ========== */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h6 className="mb-0 fw-semibold">Thông tin tài khoản</h6>
        </div>
        <div className="card-body p-4">
          <div className="row g-3 mb-0">
            <div className="col-md-6">
              <label className="form-label small fw-medium">Họ và tên</label>
              <input className="form-control" value={user?.full_name || ''} disabled />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium">Số CCCD/CMND</label>
              <input className="form-control" value={user?.cccd || ''} disabled />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium">Email</label>
              <input className="form-control" value={user?.email || ''} disabled />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium">Số điện thoại</label>
              <input className="form-control" value={user?.phone || ''} disabled />
            </div>
          </div>
          <p className="text-muted small mt-2 mb-0">
            * Thông tin tài khoản không thể sửa trực tiếp. Liên hệ Phòng tuyển sinh nếu cần thay đổi.
          </p>
        </div>
      </div>

      {/* ========== PHẦN HỒ SƠ CHI TIẾT ========== */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h6 className="mb-0 fw-semibold">Thông tin hồ sơ thí sinh</h6>
        </div>
        <div className="card-body p-4">
          {profileAlert && (
            <div className={`alert alert-${profileAlert.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 py-2`}>
              {profileAlert.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {profileAlert.message}
            </div>
          )}
          <form onSubmit={handleSaveProfile}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="profile-dob" className="form-label small fw-medium">
                  Ngày sinh <span className="text-danger">*</span>
                </label>
                <input
                  id="profile-dob"
                  type="date"
                  className="form-control"
                  value={formData.dob}
                  onChange={handleDobChange}
                  required
                  max={(() => {
                    const d = new Date();
                    d.setFullYear(d.getFullYear() - MIN_AGE);
                    return d.toISOString().split('T')[0];
                  })()}
                  min={(() => {
                    const d = new Date();
                    d.setFullYear(d.getFullYear() - MAX_AGE);
                    return d.toISOString().split('T')[0];
                  })()}
                  style={{
                    borderColor:
                      dobValidation.valid === true ? '#16a34a'
                      : dobValidation.valid === false ? '#dc2626'
                      : undefined,
                  }}
                  aria-describedby="dob-feedback"
                />
                {/* Feedback ngay dưới input */}
                {dobValidation.valid !== null && (
                  <div
                    id="dob-feedback"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      marginTop: 5,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: dobValidation.valid ? '#166534' : '#991b1b',
                    }}
                    role="status"
                    aria-live="polite"
                  >
                    {dobValidation.valid
                      ? <CheckCircle size={13} />
                      : <AlertTriangle size={13} />}
                    {dobValidation.message}
                  </div>
                )}
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-medium">Giới tính <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-medium">Diện ưu tiên khu vực</label>
                <select
                  className="form-select"
                  value={formData.priority_area}
                  onChange={(e) => setFormData({ ...formData, priority_area: e.target.value })}
                >
                  <option value="">-- Không có --</option>
                  <option value="KV1">KV1 - Miền núi, vùng cao</option>
                  <option value="KV2-NT">KV2-NT - Nông thôn</option>
                  <option value="KV2">KV2 - Thành phố vừa</option>
                  <option value="KV3">KV3 - TP trực thuộc TW</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">Đối tượng ưu tiên</label>
                <select
                  className="form-select"
                  value={formData.priority_object}
                  onChange={(e) => setFormData({ ...formData, priority_object: e.target.value })}
                >
                  <option value="">-- Không có --</option>
                  <option value="01">01 - Con liệt sĩ</option>
                  <option value="02">02 - Con thương binh</option>
                  <option value="07">07 - Hộ nghèo</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">Địa chỉ thường trú <span className="text-danger">*</span></label>
                <input
                  type="text" className="form-control" placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="mt-3 d-flex align-items-center gap-2">
              <button type="submit" disabled={savingProfile} className="btn btn-primary d-flex align-items-center gap-2">
                {savingProfile ? <Loader size={16} className="spin-icon" /> : <Save size={16} />}
                {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              {profile?.status && (
                <span className="small text-muted">
                  Trạng thái hồ sơ: <StatusBadge status={profile.status} />
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ========== PHẦN ĐIỂM SỐ & XÁC MINH (4-step flow) ========== */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h6 className="mb-0 fw-semibold">Điểm học bạ &amp; Xác minh minh chứng</h6>
        </div>
        <div className="card-body p-4">
          <ScoreVerificationFlow
            profileStatus={profile?.status}
            isVerified={isVerified}
          />
        </div>
      </div>

      {/* ========== GIẤY TỜ BẮT BUỘC KHÁC (CCCD, Bằng TN) ========== */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h6 className="mb-0 fw-semibold">Giấy tờ hồ sơ bắt buộc khác</h6>
        </div>
        <div className="card-body p-4">
          {uploadAlert && (
            <div className={`alert alert-${uploadAlert.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 py-2 mb-4`}>
              {uploadAlert.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {uploadAlert.message}
            </div>
          )}
          <div className="table-responsive border rounded bg-light p-2">
            <table className="table table-borderless align-middle mb-0">
              <thead>
                <tr className="border-bottom">
                  <th className="small fw-bold py-2">Loại giấy tờ</th>
                  <th className="small fw-bold py-2" style={{ width: '250px' }}>Tình trạng</th>
                  <th className="small fw-bold py-2 text-end" style={{ width: '180px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {OTHER_REQUIRED_DOCS.map((req) => {
                  const uploaded = documents.filter((d) => d.type === req.type);
                  const uniqueStatuses = [...new Set(uploaded.map((d) => d.status))];
                  return (
                    <tr key={req.type} className="border-bottom">
                      <td className="py-3"><div className="fw-medium">{req.label} <span className="text-danger">*</span></div></td>
                      <td>
                        {uploaded.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {uniqueStatuses.map((s) => <StatusBadge key={`${req.type}-${s}`} status={s} />)}
                            <span className="small text-muted ms-1">({uploaded.length} tệp)</span>
                          </div>
                        ) : (
                          <span className="text-danger small">Chưa có tệp nào</span>
                        )}
                      </td>
                      <td className="text-end">
                        <input
                          type="file" id={`file-${req.type}`} className="d-none"
                          accept=".jpg,.jpeg,.png,.pdf" multiple
                          onChange={(e) => handleQuickUpload(req.type, e.target.files)}
                          disabled={uploadingDoc}
                        />
                        <label
                          htmlFor={`file-${req.type}`}
                          className={`btn btn-sm ${uploaded.length > 0 ? 'btn-outline-primary' : 'btn-primary'} d-inline-flex align-items-center gap-2`}
                          style={{ cursor: 'pointer' }}
                        >
                          <Upload size={14} /> {uploaded.length > 0 ? 'Tải tệp mới' : 'Chọn file'}
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* All uploaded docs list */}
          <div className="mt-4">
            <h6 className="small fw-bold text-uppercase text-muted mb-3">Danh sách tệp đã tải lên</h6>
            {documents.filter((d) => d.type !== 'ACADEMIC_RECORD').length === 0 ? (
              <div className="text-center text-muted py-4 border rounded bg-light">
                <FileText size={30} className="mb-2 opacity-50" />
                <p className="mb-0 small">Chưa có minh chứng nào được lưu.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="small">Loại giấy tờ</th>
                      <th className="small">File</th>
                      <th className="small">Trạng thái</th>
                      <th className="small">Ngày tải lên</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {documents
                      .filter((d) => d.type !== 'ACADEMIC_RECORD')
                      .map((doc) => (
                        <tr key={doc.id}>
                          <td className="small fw-medium">{DOCUMENT_TYPE_LABELS[doc.type] || doc.type}</td>
                          <td>
                            <a href={`http://localhost:8000${doc.file_url}`} target="_blank" rel="noreferrer" className="small text-decoration-none">
                              <FileText size={14} className="me-1" />Xem tài liệu
                            </a>
                          </td>
                          <td><StatusBadge status={doc.status} /></td>
                          <td className="small text-muted">{new Date(doc.uploaded_at).toLocaleDateString('vi-VN')}</td>
                          <td className="text-end">
                            <button onClick={() => handleDelete(doc.id)} className="btn btn-link text-danger p-0" title="Xoá">
                              <span style={{ fontSize: 14 }}>✕</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
