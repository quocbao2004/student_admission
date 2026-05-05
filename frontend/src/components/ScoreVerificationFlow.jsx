import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Save, ChevronRight, ChevronLeft, Upload, Calculator,
  CheckCircle2, XCircle, Clock, AlertTriangle, FileText,
  Loader, Trash2, Lock, ShieldCheck, Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../config';

// ─── Constants ───────────────────────────────────────────────────────────────

const SUBJECT_LIST = [
  'Toán', 'Ngữ văn', 'Vật lý', 'Hóa học',
  'Sinh học', 'Lịch sử', 'Địa lý', 'Ngoại ngữ', 'GDCD',
];

const SPECIAL_SCORES = [
  { key: 'Đánh giá năng lực', label: 'Điểm ĐGNL (HSA/APT)', placeholder: 'VD: 850 hoặc 105' },
  { key: 'Chứng chỉ IELTS',   label: 'IELTS Band Score',     placeholder: 'VD: 6.5' },
  { key: 'Chứng chỉ SAT',     label: 'SAT Total Score',      placeholder: 'VD: 1450' },
];

const SUB_STEPS = [
  { label: 'Nhập điểm học bạ' },
  { label: 'Tổ hợp điểm tự động' },
  { label: 'Tải minh chứng' },
  { label: 'Hậu kiểm & Xác minh' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Lookup score by subject name (case-insensitive). */
function lookupScore(scoresMap, subjectName) {
  const key = Object.keys(scoresMap).find(
    (k) => k.trim().toLowerCase() === (subjectName || '').trim().toLowerCase(),
  );
  return key !== undefined ? parseFloat(scoresMap[key]) : null;
}

/** Calculate total score for one combination given a scoresMap. */
function calcComboScore(combo, scoresMap) {
  const subjects = [combo.subject1, combo.subject2, combo.subject3].filter(Boolean);
  let total = 0;
  const rows = subjects.map((s) => {
    const score = lookupScore(scoresMap, s);
    if (score !== null && !isNaN(score)) { total += score; return { s, score }; }
    return { s, score: null };
  });
  const complete = rows.every((r) => r.score !== null);
  return { total: complete ? parseFloat(total.toFixed(2)) : null, rows };
}

// ─── Mini stepper UI ─────────────────────────────────────────────────────────

function SubStepper({ current, maxReached, onGo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
      {SUB_STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const locked = i > maxReached;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <button
                onClick={() => !locked && onGo(i)}
                disabled={locked}
                title={locked ? 'Hoàn thành bước trước để mở khóa' : s.label}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  backgroundColor: done ? 'var(--uni-primary)' : active ? '#fff' : 'var(--color-gray-100)',
                  border: active ? '2px solid var(--uni-primary)' : done ? 'none' : '2px solid var(--border-strong)',
                  color: done ? '#fff' : active ? 'var(--uni-primary)' : locked ? 'var(--text-muted)' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.8rem',
                }}
              >
                {done ? <CheckCircle2 size={15} /> : locked ? <Lock size={12} /> : i + 1}
              </button>
              <div style={{
                fontSize: '0.7rem', marginTop: 5, textAlign: 'center',
                fontWeight: active ? 700 : 400,
                color: locked ? 'var(--text-muted)' : done ? 'var(--uni-primary)' : active ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
                {s.label}
              </div>
            </div>
            {i < SUB_STEPS.length - 1 && (
              <div style={{ height: 2, flex: 0.5, backgroundColor: i < current ? 'var(--uni-primary)' : 'var(--border-default)', margin: '0 4px', marginBottom: 20 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

function Alert({ alert }) {
  if (!alert) return null;
  const isOk = alert.type === 'success';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
      marginBottom: 16, borderRadius: 4, fontSize: '0.82rem',
      backgroundColor: isOk ? '#dcfce7' : '#fef2f2',
      border: `1px solid ${isOk ? '#bbf7d0' : '#fecaca'}`,
      color: isOk ? '#166534' : '#991b1b',
    }}>
      {isOk ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
      {alert.message}
    </div>
  );
}

// ─── Step 1: Score Input ──────────────────────────────────────────────────────

function StepInput({ scoresMap, onChange, onSave, saving, isVerified }) {
  return (
    <div>
      {/* Section 1: Transcript */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem', color: 'var(--uni-primary)' }}>
          <FileText size={16} /> 1. Điểm trung bình học bạ (Lớp 12)
        </h6>
        <div className="row g-3" style={{ maxWidth: 650 }}>
          {SUBJECT_LIST.map((subj) => (
            <div className="col-6 col-sm-4" key={subj}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                {subj}
              </label>
              <input
                type="number"
                step="0.1" min="0" max="10"
                className="form-control form-control-sm"
                placeholder="—"
                value={scoresMap[subj] ?? ''}
                onChange={(e) => onChange(subj, e.target.value)}
                disabled={isVerified}
              />
            </div>
          ))}
        </div>
      </div>

      <hr className="my-4" />

      {/* Section 2: Special Scores */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem', color: 'var(--uni-secondary)' }}>
          <Award size={16} /> 2. Điểm ĐGNL &amp; Chứng chỉ quốc tế
        </h6>
        <div className="row g-3" style={{ maxWidth: 650 }}>
          {SPECIAL_SCORES.map((s) => (
            <div className="col-md-4" key={s.key}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                {s.label}
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder={s.placeholder}
                value={scoresMap[s.key] ?? ''}
                onChange={(e) => onChange(s.key, e.target.value)}
                disabled={isVerified}
              />
            </div>
          ))}
        </div>
        <p className="small text-muted mt-2 italic" style={{ fontSize: '0.72rem' }}>
          * Nếu không tham gia thi ĐGNL hoặc không có chứng chỉ, bạn có thể để trống mục này.
        </p>
      </div>

      <div style={{ marginTop: 32 }}>
        <button
          className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
          onClick={onSave}
          disabled={saving || isVerified}
        >
          {saving ? <Loader size={16} className="spin-icon" /> : <Save size={16} />}
          {saving ? 'Đang lưu...' : 'Lưu thông tin & Tiếp tục'}
          {!saving && <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Combination Calculation ─────────────────────────────────────────

function StepCalc({ combinations, scoresMap, onNext, onBack }) {
  const ranked = useMemo(() => {
    return combinations
      .map((c) => ({ ...c, ...calcComboScore(c, scoresMap) }))
      .filter((c) => c.complete)
      .sort((a, b) => b.total - a.total);
  }, [combinations, scoresMap]);

  const allIncomplete = combinations.every((c) => !calcComboScore(c, scoresMap).complete);

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
        Hệ thống tự động tính tổng điểm cho các tổ hợp xét tuyển của trường dựa trên điểm bạn đã nhập.
      </p>

      {allIncomplete ? (
        <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-subtle)', borderRadius: 6, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Calculator size={28} style={{ opacity: 0.4, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
          Không đủ điểm để tính cho bất kỳ tổ hợp nào. Vui lòng quay lại nhập thêm môn.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.83rem' }}>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Mã tổ hợp</th>
                <th>Các môn</th>
                <th style={{ textAlign: 'right' }}>Tổng điểm</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ color: i === 0 ? '#c9973e' : 'var(--text-muted)', fontWeight: i === 0 ? 800 : 400 }}>
                    {i === 0 ? '★' : i + 1}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{c.code}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {c.rows.map((r) => `${r.s} (${r.score ?? '?'})`).join(' + ')}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: i === 0 ? 'var(--uni-primary)' : 'inherit' }}>
                    {c.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={onBack}>
          <ChevronLeft size={14} /> Sửa điểm
        </button>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={onNext}>
          Tiếp tục tải minh chứng <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Document Upload ──────────────────────────────────────────────────

function StepUpload({ documents, onUpload, uploading, isVerified, scoresMap, onNext, onBack }) {
  // Determine required docs based on Step 1 inputs
  const requiredDocs = [
    { type: 'ACADEMIC_RECORD', label: 'Học bạ THPT (Bản gốc/Công chứng)', icon: <FileText size={18} /> }
  ];

  if (scoresMap['Đánh giá năng lực']) {
    requiredDocs.push({ type: 'HSA_CERT', label: 'Giấy chứng nhận điểm ĐGNL', icon: <Award size={18} /> });
  }
  if (scoresMap['Chứng chỉ IELTS']) {
    requiredDocs.push({ type: 'IELTS_CERT', label: 'Chứng chỉ IELTS (Bản gốc)', icon: <Award size={18} /> });
  }
  if (scoresMap['Chứng chỉ SAT']) {
    requiredDocs.push({ type: 'SAT_CERT', label: 'Chứng chỉ SAT', icon: <Award size={18} /> });
  }

  const allUploaded = requiredDocs.every(req => documents.some(d => d.type === req.type));

  return (
    <div>
      <div className="alert alert-warning py-2 px-3 d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.8rem' }}>
        <AlertTriangle size={16} />
        Dựa trên thông tin bạn đã khai báo, vui lòng tải lên đầy đủ các minh chứng sau để đối soát:
      </div>

      <div className="row g-3 mb-4">
        {requiredDocs.map((req) => {
          const uploaded = documents.filter(d => d.type === req.type);
          return (
            <div className="col-md-6" key={req.type}>
              <div className="p-3 border rounded bg-light h-100 shadow-sm transition-all hover:border-primary">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="p-2 bg-white rounded border text-primary">{req.icon}</div>
                    <div>
                      <div className="fw-bold text-slate-800" style={{ fontSize: '0.85rem' }}>{req.label}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {uploaded.length > 0 ? `Đã tải lên ${uploaded.length} tệp` : 'Chưa có tệp nào'}
                      </div>
                    </div>
                  </div>
                  {uploaded.length > 0 && <CheckCircle2 size={18} className="text-success" />}
                </div>

                <div className="d-flex gap-2">
                  <input
                    type="file"
                    id={`file-${req.type}`}
                    className="d-none"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => onUpload(req.type, e.target.files)}
                    disabled={uploading || isVerified}
                  />
                  <label
                    htmlFor={`file-${req.type}`}
                    className={`btn btn-sm ${uploaded.length > 0 ? 'btn-outline-primary' : 'btn-primary'} w-100 d-flex align-items-center justify-content-center gap-2`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {uploading ? <Loader size={14} className="spin-icon" /> : <Upload size={14} />}
                    {uploaded.length > 0 ? 'Tải thêm' : 'Tải lên ngay'}
                  </label>
                </div>
                
                {uploaded.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploaded.map(doc => (
                      <div key={doc.id} className="d-flex justify-content-between align-items-center p-1 px-2 bg-white rounded border" style={{ fontSize: '0.65rem' }}>
                        <span className="text-truncate text-slate-500" style={{ maxWidth: '70%' }}>#{doc.id.split('-')[0]}</span>
                        <span className={`badge ${doc.status === 'VERIFIED' ? 'bg-success' : doc.status === 'REJECTED' ? 'bg-danger' : 'bg-warning'} text-white`} style={{ transform: 'scale(0.8)' }}>
                          {doc.status === 'VERIFIED' ? 'Đã duyệt' : doc.status === 'REJECTED' ? 'Từ chối' : 'Chờ'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={onBack}>
          <ChevronLeft size={14} /> Quay lại
        </button>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={onNext}
          disabled={!allUploaded || uploading}
          title={!allUploaded ? 'Vui lòng tải lên đầy đủ các minh chứng bắt buộc' : ''}
        >
          <ShieldCheck size={16} /> Gửi hồ sơ xác minh <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Verification Status ─────────────────────────────────────────────

const STATUS_CONFIG = {
  DRAFT:          { icon: <Clock size={32} />, color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', label: 'Chưa gửi xác minh',        desc: 'Hồ sơ của bạn chưa được gửi đến tổ kiểm tra.' },
  PENDING_VERIFY: { icon: <Clock size={32} />, color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Đang chờ xác minh',        desc: 'Tổ kiểm tra đang đối soát điểm số với ảnh học bạ của bạn. Thường mất 1–3 ngày làm việc.' },
  PENDING:        { icon: <Clock size={32} />, color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Đang chờ xác minh',        desc: 'Tổ kiểm tra đang đối soát điểm số với ảnh học bạ của bạn. Thường mất 1–3 ngày làm việc.' },
  VERIFIED:       { icon: <CheckCircle2 size={32} />, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Đã xác minh – Hợp lệ', desc: 'Điểm số đã được xác nhận hợp lệ. Hồ sơ được chuyển vào danh sách xét tuyển chính thức.' },
  REJECTED:       { icon: <XCircle size={32} />, color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Không hợp lệ – Cần bổ sung', desc: 'Điểm nhập không khớp với học bạ. Vui lòng kiểm tra lại và liên hệ Phòng tuyển sinh.' },
};

function StepVerify({ profileStatus, onBack, documents }) {
  const cfg = STATUS_CONFIG[profileStatus] || STATUS_CONFIG.DRAFT;
  return (
    <div>
      <div style={{
        textAlign: 'center', padding: '28px 20px',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: 6, color: cfg.color,
      }}>
        <div style={{ marginBottom: 10 }}>{cfg.icon}</div>
        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 6 }}>{cfg.label}</div>
        <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0 }}>{cfg.desc}</p>
      </div>

      {/* What happens in this step */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>Quy trình hậu kiểm:</strong>
        <ol style={{ paddingLeft: 16, margin: 0, lineHeight: 1.8 }}>
          <li>Cán bộ tuyển sinh mở file học bạ bạn đã upload.</li>
          <li>Đối chiếu từng môn với điểm bạn đã nhập vào hệ thống.</li>
          <li>Nếu khớp → trạng thái <strong style={{ color: '#16a34a' }}>VERIFIED</strong>, hồ sơ được duyệt.</li>
          <li>Nếu sai lệch → trạng thái <strong style={{ color: '#dc2626' }}>REJECTED</strong>, thí sinh cần liên hệ.</li>
        </ol>
      </div>

      <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 mt-4" onClick={onBack}>
        <ChevronLeft size={14} /> Quay lại xem tổ hợp điểm
      </button>
    </div>
  );
}

// ─── Status chip ─────────────────────────────────────────────────────────────

function StatusChip({ status }) {
  const map = {
    DRAFT: ['Nháp', '#6b7280', '#f3f4f6'],
    PENDING_VERIFY: ['Chờ duyệt', '#d97706', '#fffbeb'],
    PENDING: ['Chờ duyệt', '#d97706', '#fffbeb'],
    VERIFIED: ['Đã xác minh', '#16a34a', '#dcfce7'],
    REJECTED: ['Từ chối', '#dc2626', '#fef2f2'],
  };
  const [label, color, bg] = map[status] || ['Unknown', '#6b7280', '#f3f4f6'];
  return (
    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 2, background: bg, color }}>
      {label}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ScoreVerificationFlow({ profileStatus, isVerified }) {
  const { token, logout } = useAuth();
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);

  const [scoresMap, setScoresMap] = useState({});
  const [combinations, setCombinations] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);

  const authFetch = useCallback(async (url, options = {}) => {
    // KHÔNG set Content-Type mặc định — để browser tự set cho FormData
    const headers = { ...(options.headers || {}), 'Authorization': `Bearer ${token}` };
    if (!options.body || !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) { logout(); throw new Error('Hết hạn phiên đăng nhập'); }
    return res;
  }, [token, logout]);

  useEffect(() => {
    const init = async () => {
      try {
        const [scoreRes, catRes, docRes] = await Promise.all([
          authFetch(`${API_BASE}/admissions/profile/scores/`),
          authFetch(`${API_BASE}/admissions/catalogs/`),
          authFetch(`${API_BASE}/admissions/documents/`),
        ]);
        
        const [scoreData, catData, docData] = await Promise.all([
          scoreRes.json(), catRes.json(), docRes.json()
        ]);

        let newMax = 0;
        if (scoreRes.ok) {
          const map = {};
          scoreData.forEach(s => { map[s.subject] = String(s.score); });
          setScoresMap(map);
          if (scoreData.length > 0) newMax = 1;
        }
        if (catRes.ok) setCombinations(catData.combinations || []);
        if (docRes.ok) {
          const scoreDocs = docData.filter(d => 
            ['ACADEMIC_RECORD', 'HSA_CERT', 'IELTS_CERT', 'SAT_CERT'].includes(d.type)
          );
          setDocuments(scoreDocs);
          if (scoreDocs.length > 0 && newMax >= 1) newMax = 2;
        }
        
        setMaxReached(newMax);
        
        // Auto-navigate to correct step
        if (profileStatus === 'VERIFIED' || profileStatus === 'PENDING_VERIFY' || profileStatus === 'REJECTED') {
          setStep(3);
          setMaxReached(3);
        } else {
          setStep(newMax);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [authFetch, profileStatus]);

  // Sau khi load, auto-navigate dựa trên tổng hợp
  useEffect(() => {
    if (!loading) return;
    if (profileStatus === 'VERIFIED' || profileStatus === 'PENDING_VERIFY' || profileStatus === 'REJECTED') {
      setStep(3);
      setMaxReached(3);
    }
  }, [loading, profileStatus]);

  const handleScoreChange = (subj, val) => {
    setScoresMap(prev => ({ ...prev, [subj]: val }));
  };

  const handleSaveScores = async () => {
    try {
      setSaving(true);
      setAlert(null);
      const payload = Object.entries(scoresMap)
        .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
        .map(([s, v]) => ({ subject: s, score: parseFloat(v) }));

      if (payload.length === 0) {
        setAlert({ type: 'error', message: 'Vui lòng nhập ít nhất 1 môn.' });
        return;
      }

      // Backend nhận array thẳng, không phải { scores: [...] }
      const res = await authFetch(`${API_BASE}/admissions/profile/scores/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setAlert({ type: 'success', message: 'Lưu điểm thành công!' });
        setMaxReached(prev => Math.max(prev, 1));
        setTimeout(() => { setStep(1); setAlert(null); }, 800);
      } else {
        setAlert({ type: 'error', message: 'Lỗi khi lưu điểm.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (type, files) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      setAlert(null);

      // Backend nhận 'doc_type' + 'files' (plural) qua multipart
      const formData = new FormData();
      formData.append('doc_type', type);
      Array.from(files).forEach(f => formData.append('files', f));

      const res = await fetch(`${API_BASE}/admissions/documents/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        // Chuyển object lỗi thành text thân thiện
        const messages = Object.entries(errData)
          .map(([field, msgs]) => {
            const fieldLabel = field === 'doc_type' ? 'Loại tài liệu' : field;
            const msgText = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
            return `${fieldLabel}: ${msgText}`;
          })
          .join(' | ');
        throw new Error(messages || 'Tải lên thất bại.');
      }

      const newDocs = await res.json(); // backend trả về array
      setDocuments(prev => [...newDocs, ...prev]);
      setAlert({ type: 'success', message: `Đã tải lên ${newDocs.length} tệp thành công!` });
      setMaxReached(prev => Math.max(prev, 2));
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: 'error', message: `Lỗi khi tải file: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setUploading(true);
      setAlert(null);
      const res = await authFetch(`${API_BASE}/admissions/profile/submit/`, { method: 'POST' });
      if (res.ok) {
        setStep(3);
        setMaxReached(3);
        // Tải lại trang để refresh lại AdmissionFlowContext (chuyển sang bước chờ xác minh trên header)
        window.location.reload();
      } else {
        const err = await res.json();
        setAlert({ type: 'error', message: err.error || 'Lỗi gửi xác minh.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Lỗi gửi xác minh.' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <Loader className="spin-icon text-primary mb-2" />
      <div className="small text-muted">Đang tải quy trình xác minh...</div>
    </div>
  );

  return (
    <div className="score-flow">
      <SubStepper current={step} maxReached={maxReached} onGo={setStep} />
      <Alert alert={alert} />

      {isVerified && step !== 3 && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
          <ShieldCheck size={16} />
          Hồ sơ đã được xác minh. Dữ liệu điểm đã được khóa.
        </div>
      )}

      <div className="flow-content" style={{ minHeight: 300 }}>
        {step === 0 && (
          <StepInput
            scoresMap={scoresMap}
            onChange={handleScoreChange}
            onSave={handleSaveScores}
            saving={saving}
            isVerified={isVerified}
          />
        )}
        {step === 1 && (
          <StepCalc
            combinations={combinations}
            scoresMap={scoresMap}
            onNext={() => { setStep(2); setMaxReached(prev => Math.max(prev, 2)); }}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepUpload
            documents={documents}
            uploading={uploading}
            onUpload={handleUpload}
            isVerified={isVerified}
            scoresMap={scoresMap}
            onNext={handleFinalSubmit}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepVerify
            profileStatus={profileStatus}
            onBack={() => setStep(1)}
            documents={documents}
          />
        )}
      </div>
    </div>
  );
}

