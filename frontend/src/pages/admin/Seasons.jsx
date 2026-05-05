import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Calendar, Loader, Check, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';

const STATUS_MAP = {
  PLANNING: { label: 'Lên kế hoạch', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  OPEN: { label: 'Đang mở', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  CLOSED: { label: 'Đã đóng', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  PROCESSING: { label: 'Đang xét tuyển', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-[#ECFDF3] text-[#027A48] border-[#D1FADF]' },
};

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, { label }]) => ({ value, label }));

export default function Seasons() {
  const { token, logout } = useAuth();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    round_number: 1,
    name: '',
    status: 'PLANNING',
    start_date: '',
    end_date: '',
    is_active: false,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
    return res;
  };

  const fetchSeasons = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/admissions/admin/seasons/`);
      setSeasons(await res.json());
    } catch {
      showToast('Lỗi tải dữ liệu đợt xét tuyển', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSeasons(); }, []);

  const groupedByYear = useMemo(() => {
    const map = {};
    for (const s of seasons) {
      if (!map[s.year]) map[s.year] = [];
      map[s.year].push(s);
    }
    return Object.entries(map).sort(([a], [b]) => Number(b) - Number(a));
  }, [seasons]);

  const openModal = (season = null) => {
    setEditingSeason(season);
    setFormData(season ? {
      year: season.year,
      round_number: season.round_number,
      name: season.name,
      status: season.status,
      start_date: season.start_date || '',
      end_date: season.end_date || '',
      is_active: season.is_active,
    } : {
      year: new Date().getFullYear(),
      round_number: 1,
      name: '',
      status: 'PLANNING',
      start_date: '',
      end_date: '',
      is_active: false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.start_date) payload.start_date = null;
    if (!payload.end_date) payload.end_date = null;

    const url = editingSeason
      ? `${API_BASE}/admissions/admin/seasons/${editingSeason.id}/`
      : `${API_BASE}/admissions/admin/seasons/`;

    try {
      const res = await authFetch(url, {
        method: editingSeason ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || JSON.stringify(err));
      }
      setIsModalOpen(false);
      fetchSeasons();
      showToast(editingSeason ? 'Đã cập nhật đợt xét tuyển.' : 'Đã tạo đợt xét tuyển mới.');
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá đợt xét tuyển này?')) return;
    try {
      const res = await authFetch(`${API_BASE}/admissions/admin/seasons/${id}/`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi không xác định');
      }
      fetchSeasons();
      showToast('Đã xoá đợt xét tuyển.');
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    }
  };

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 font-sans text-slate-900 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl border flex items-center gap-3
          ${toast.type === 'error' ? 'bg-white border-red-100 text-red-600' : 'bg-slate-900 border-slate-800 text-white'}`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <Check size={18} className="text-emerald-400" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Đợt xét tuyển</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý các đợt tuyển sinh theo năm và đợt.</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
          onClick={() => openModal()}
        >
          <Plus size={16} /> Tạo đợt mới
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader className="animate-spin mx-auto mb-2" /> Đang tải...
        </div>
      ) : groupedByYear.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Calendar size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa có đợt xét tuyển nào</h3>
          <p className="text-sm text-slate-500 mb-6">Tạo đợt xét tuyển đầu tiên để bắt đầu.</p>
          <button onClick={() => openModal()} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800">
            <Plus size={16} className="inline mr-2" /> Tạo đợt mới
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByYear.map(([year, yearSeasons]) => (
            <div key={year}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">Năm {year}</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  {yearSeasons.length} đợt
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {yearSeasons.map(season => {
                  const statusInfo = STATUS_MAP[season.status] || STATUS_MAP.PLANNING;
                  return (
                    <div key={season.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900">{season.name}</h4>
                            {season.is_active && (
                              <span className="text-[9px] font-bold uppercase bg-[#ECFDF3] text-[#027A48] border border-[#D1FADF] px-1.5 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-medium">
                            Đợt {season.round_number} — {season.application_count} hồ sơ
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {(season.start_date || season.end_date) && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                          <Calendar size={12} />
                          <span>
                            {season.start_date || '—'} → {season.end_date || '—'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => openModal(season)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                        >
                          <Edit2 size={12} /> Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(season.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={12} /> Xoá
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-900">
                  {editingSeason ? 'Cập nhật đợt xét tuyển' : 'Tạo đợt xét tuyển mới'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Tên đợt</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                    placeholder="VD: Đợt 1 — Xét tuyển sớm"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Năm</label>
                    <input
                      type="number"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={formData.year}
                      onChange={e => updateField('year', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Đợt số</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={formData.round_number}
                      onChange={e => updateField('round_number', Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Trạng thái</label>
                  <select
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                    value={formData.status}
                    onChange={e => updateField('status', e.target.value)}
                  >
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Ngày bắt đầu</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={formData.start_date}
                      onChange={e => updateField('start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Ngày kết thúc</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={formData.end_date}
                      onChange={e => updateField('end_date', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={e => updateField('is_active', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                    Đặt làm đợt đang hoạt động
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm">
                  {editingSeason ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
