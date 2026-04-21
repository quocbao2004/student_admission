import { useState, useEffect, useRef } from 'react';
import { Upload, Save, Trash2, FileText, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = 'http://localhost:8000/api';

const DOCUMENT_TYPE_LABELS = {
  ACADEMIC_RECORD: 'Học bạ THPT',
  IELTS: 'Chứng chỉ Ngoại ngữ (IELTS/TOEIC)',
  CCCD: 'CCCD / Căn cước công dân',
  ACHIEVEMENT: 'Giấy khen / Thành tích',
};

const StatusBadge = ({ status }) => {
  const map = {
    PENDING: { label: 'Chờ duyệt', cls: 'bg-warning text-dark' },
    VERIFIED: { label: 'Đã xác minh', cls: 'bg-success text-white' },
    REJECTED: { label: 'Từ chối', cls: 'bg-danger text-white' },
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

export default function Profile() {
  const { user } = useAuth();
  const authFetch = useAuthFetch();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ dob: '', gender: '', address: '', priority_area: '', priority_object: '' });
  const [documents, setDocuments] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState('ACADEMIC_RECORD');

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null); // { type: 'success'|'error', message }
  const [uploadAlert, setUploadAlert] = useState(null);

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch(`${API_BASE}/admissions/profile/me/`);
        const data = await res.json();
        if (res.ok) {
          setProfile(data);
          setFormData({
            dob: data.dob || '',
            gender: data.gender || '',
            address: data.address || '',
            priority_area: data.priority_area || '',
            priority_object: data.priority_object || '',
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
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
      setProfileAlert({ type: 'success', message: 'Cập nhật hồ sơ thành công!' });
    } catch (err) {
      setProfileAlert({ type: 'error', message: 'Cập nhật thất bại. Vui lòng thử lại.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(true);
    setUploadAlert(null);
    const fd = new FormData();
    fd.append('doc_type', selectedDocType);
    fd.append('file', file);
    try {
      const res = await authFetch(`${API_BASE}/admissions/documents/`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.file?.[0] || data.doc_type?.[0] || data.error || 'Tải lên thất bại.';
        throw new Error(msg);
      }
      setDocuments((prev) => [data, ...prev]);
      setUploadAlert({ type: 'success', message: `Tải lên "${DOCUMENT_TYPE_LABELS[data.type]}" thành công!` });
    } catch (err) {
      setUploadAlert({ type: 'error', message: err.message });
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
                <label className="form-label small fw-medium">Ngày sinh</label>
                <input
                  type="date" className="form-control"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-medium">Giới tính</label>
                <select
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                <label className="form-label small fw-medium">Địa chỉ thường trú</label>
                <input
                  type="text" className="form-control" placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

      {/* ========== PHẦN TẢI MINH CHỨNG ========== */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h6 className="mb-0 fw-semibold">Minh chứng & Giấy tờ</h6>
        </div>
        <div className="card-body p-4">
          {uploadAlert && (
            <div className={`alert alert-${uploadAlert.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 py-2`}>
              {uploadAlert.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {uploadAlert.message}
            </div>
          )}

          {/* Upload Zone */}
          <div className="border rounded p-4 mb-4 bg-light">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label small fw-medium">Loại giấy tờ</label>
                <select className="form-select" value={selectedDocType} onChange={(e) => setSelectedDocType(e.target.value)}>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-5">
                <label className="form-label small fw-medium">Chọn file (JPG, PNG, PDF, tối đa 5MB)</label>
                <input
                  ref={fileInputRef}
                  type="file" className="form-control"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleUpload}
                  disabled={uploadingDoc}
                />
              </div>
              <div className="col-md-2">
                {uploadingDoc && (
                  <div className="d-flex align-items-center gap-2 text-primary">
                    <Loader size={18} className="spin-icon" />
                    <span className="small">Đang tải...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách tài liệu đã tải */}
          {documents.length === 0 ? (
            <div className="text-center text-muted py-4">
              <FileText size={36} className="mb-2 opacity-50" />
              <p className="mb-0 small">Chưa có minh chứng nào được tải lên.</p>
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="small fw-medium">{DOCUMENT_TYPE_LABELS[doc.type] || doc.type}</td>
                      <td>
                        <a href={`http://localhost:8000${doc.file_url}`} target="_blank" rel="noreferrer" className="small text-decoration-none">
                          <FileText size={14} className="me-1" />
                          Xem tài liệu
                        </a>
                      </td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td className="small text-muted">{new Date(doc.uploaded_at).toLocaleDateString('vi-VN')}</td>
                      <td className="text-end">
                        <button onClick={() => handleDelete(doc.id)} className="btn btn-link text-danger p-0" title="Xoá">
                          <Trash2 size={16} />
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
  );
}
