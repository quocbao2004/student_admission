import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle2, ChevronRight, GraduationCap, Info, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmissionFlow } from '../../contexts/AdmissionFlowContext';
import { API_BASE } from '../../config';
import { Link } from 'react-router-dom';

export default function Aspirations() {
  const { token, logout } = useAuth();
  const { updateCompletion } = useAdmissionFlow();
  
  const [catalogs, setCatalogs] = useState({ majors: [], methods: [], combinations: [] });
  const [applications, setApplications] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formData, setFormData] = useState({ major_id: '', method_id: '', combination_id: '' });

  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
    return res;
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [catRes, appRes, paymentRes] = await Promise.all([
          authFetch(`${API_BASE}/admissions/catalogs/`),
          authFetch(`${API_BASE}/admissions/applications/`),
          authFetch(`${API_BASE}/admissions/payments/status/`)
        ]);
        
        const [catData, appData, paymentData] = await Promise.all([
          catRes.json(),
          appRes.json(),
          paymentRes.json()
        ]);

        setCatalogs(catData);
        setApplications(appData);
        setPaymentSummary(paymentData);
        updateCompletion({ hasAspirations: appData.length > 0 });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleOpenAdd = () => {
    if (paymentSummary?.is_paid) return;
    if (applications.length >= 3) return;
    setEditingApp(null);
    setFormData({ major_id: '', method_id: '', combination_id: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (app) => {
    if (paymentSummary?.is_paid) return;
    setEditingApp(app);
    setFormData({
      major_id: app.major,
      method_id: app.method,
      combination_id: app.combination || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = editingApp 
        ? `${API_BASE}/admissions/applications/${editingApp.id}/` 
        : `${API_BASE}/admissions/applications/`;
      const method = editingApp ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Thao tác thất bại');

      if (editingApp) {
        setApplications(apps => apps.map(a => a.id === result.id ? result : a));
        setSuccess('Cập nhật thành công.');
      } else {
        setApplications(apps => [...apps, result]);
        updateCompletion({ hasAspirations: true });
        setSuccess('Đã thêm nguyện vọng.');
      }
      setShowModal(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appId) => {
    if (paymentSummary?.is_paid || !window.confirm('Xoá nguyện vọng này?')) return;
    try {
      const res = await authFetch(`${API_BASE}/admissions/applications/${appId}/`, { method: 'DELETE' });
      if (res.ok) {
        const updated = applications.filter(a => a.id !== appId);
        setApplications(updated);
        updateCompletion({ hasAspirations: updated.length > 0 });
        setSuccess('Đã xoá.');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) { setError(err.message); }
  };

  const isLocked = paymentSummary?.is_paid;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 font-sans text-slate-900">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Đăng ký nguyện vọng</h2>
          <p className="text-slate-500 text-sm mt-1">Bạn có thể đăng ký tối đa 3 nguyện vọng xét tuyển.</p>
        </div>
        {!isLocked && applications.length < 3 && catalogs.active_season && (
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
            onClick={handleOpenAdd}
          >
            <Plus size={18} /> Thêm nguyện vọng
          </button>
        )}
      </div>

      {(error || success) && (
        <div className={`mb-6 p-4 rounded-md flex items-center gap-3 text-sm font-medium ${error ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-slate-50 text-slate-800 border border-slate-200'}`}>
          {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {error || success}
        </div>
      )}

      {isLocked && (
        <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-3 text-sm text-slate-600 italic">
          <Info size={18} className="text-slate-400" />
          Danh sách nguyện vọng đã được khóa sau khi thanh toán lệ phí.
        </div>
      )}

      {!catalogs.active_season && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-3 text-sm text-yellow-800">
          <AlertCircle size={18} className="text-yellow-600" />
          Hiện tại không có đợt tuyển sinh nào đang mở đăng ký. Bạn không thể thêm hoặc sửa nguyện vọng lúc này.
        </div>
      )}

      <div className="space-y-4">
        {applications.length === 0 && !loading && (
          <div className="text-center py-20 border border-dashed border-slate-200 rounded-lg">
            <GraduationCap size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 text-sm">Chưa có nguyện vọng nào được đăng ký.</p>
          </div>
        )}

        {applications.map((app, index) => {
          const result = app.admission_result;
          const isPublished = result?.published;

          return (
            <div key={app.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-stretch">
                <div className="w-12 bg-slate-50 border-r border-slate-100 flex items-center justify-center font-mono font-bold text-slate-400">
                  #{index + 1}
                </div>
                <div className="flex-1 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-slate-900">{app.major_name}</h4>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{app.major_code}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{app.method_name}</span>
                        {app.combination_code && (
                          <>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>Tổ hợp: {app.combination_code}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {!isLocked && !isPublished && catalogs.active_season && (
                      <div className="flex gap-1">
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all" onClick={() => handleOpenEdit(app)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" onClick={() => handleDelete(app.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Admission Result Section */}
                  {isPublished && result && (
                    <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tổng điểm</div>
                          <div className="text-lg font-bold text-slate-900">{result.total_score?.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Xếp hạng</div>
                          <div className="text-lg font-bold text-slate-900">#{result.ranked_position}</div>
                        </div>
                      </div>
                      <div>
                        {result.is_passed ? (
                          <div className="flex items-center gap-4">
                            <Link 
                              to="/candidate/admission-letter" 
                              className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1.5"
                            >
                              In Giấy báo
                            </Link>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-widest shadow-sm">
                              <UserCheck size={16} /> Trúng tuyển
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded text-xs font-bold uppercase tracking-widest">
                            <UserX size={16} /> Không đạt
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal - Strictly Minimal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-900">{editingApp ? 'Chỉnh sửa nguyện vọng' : 'Thêm nguyện vọng mới'}</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Ngành học</label>
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                    required
                    value={formData.major_id}
                    onChange={e => setFormData({ ...formData, major_id: e.target.value, method_id: '', combination_id: '' })}
                  >
                    <option value="">Chọn ngành...</option>
                    {catalogs.majors.map(m => (
                      <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Phương thức</label>
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    required
                    value={formData.method_id}
                    onChange={e => setFormData({ ...formData, method_id: e.target.value })}
                    disabled={!formData.major_id}
                  >
                    <option value="">{formData.major_id ? 'Chọn phương thức...' : 'Vui lòng chọn ngành trước'}</option>
                    {(() => {
                      const selectedMajor = catalogs.majors.find(m => m.id === formData.major_id);
                      const availableMethods = selectedMajor && selectedMajor.allowed_methods
                        ? catalogs.methods.filter(m => selectedMajor.allowed_methods.includes(m.id))
                        : [];
                      
                      if (formData.major_id && availableMethods.length === 0) {
                        return <option value="" disabled>Ngành này chưa cấu hình phương thức xét tuyển</option>;
                      }
                      
                      return availableMethods.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ));
                    })()}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Tổ hợp môn</label>
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    value={formData.combination_id}
                    onChange={e => setFormData({ ...formData, combination_id: e.target.value })}
                    disabled={!formData.major_id}
                  >
                    <option value="">{formData.major_id ? 'Không yêu cầu...' : 'Vui lòng chọn ngành trước'}</option>
                    {(() => {
                      const selectedMajor = catalogs.majors.find(m => m.id === formData.major_id);
                      const availableCombs = selectedMajor && selectedMajor.allowed_combinations
                        ? catalogs.combinations.filter(c => selectedMajor.allowed_combinations.includes(c.id))
                        : [];
                        
                      if (formData.major_id && availableCombs.length === 0) {
                        return <option value="" disabled>Ngành này chưa cấu hình tổ hợp môn</option>;
                      }
                      
                      return availableCombs.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - ({c.subject1}, {c.subject2}, {c.subject3})</option>
                      ));
                    })()}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-all">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-all shadow-sm" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu nguyện vọng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
