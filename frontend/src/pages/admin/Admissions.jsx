import { useState, useEffect } from 'react';
import { Play, Search, Filter, Trophy, UserX, UserCheck, Loader, Send, Info, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';

export default function Admissions() {
  const { token, logout } = useAuth();
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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
    const fetchMajors = async () => {
      try {
        const res = await authFetch(`${API_BASE}/admissions/admin/majors/`);
        const data = await res.json();
        setMajors(data);
        if (data.length > 0) setSelectedMajor(data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMajors();
  }, []);

  const runRanking = async () => {
    if (!selectedMajor) return;
    setRunning(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await authFetch(`${API_BASE}/admissions/admin/ranking/${selectedMajor}/`);
      const data = await res.json();
      setRanking(data);
      setMessage({ text: 'Đã chạy lọc ảo thành công cho ngành này.', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Lỗi khi chạy lọc ảo.', type: 'error' });
    } finally {
      setRunning(false);
    }
  };

  const publishResults = async () => {
    if (!selectedMajor || !window.confirm('Bạn có chắc chắn muốn công bố kết quả cho ngành này? Hành động này sẽ thay đổi trạng thái hồ sơ của tất cả thí sinh liên quan.')) return;
    setPublishing(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await authFetch(`${API_BASE}/admissions/admin/ranking/${selectedMajor}/publish/`, {
        method: 'POST'
      });
      const data = await res.json();
      setMessage({ text: `Đã công bố kết quả cho ${data.published_count} thí sinh.`, type: 'success' });
    } catch (err) {
      setMessage({ text: 'Lỗi khi công bố kết quả.', type: 'error' });
    } finally {
      setPublishing(false);
    }
  };

  const publishBenchmark = async () => {
    if (!selectedMajor || !window.confirm('Công bố điểm chuẩn cho năm nay dựa trên danh sách trúng tuyển hiện tại?')) return;
    try {
      const res = await authFetch(`${API_BASE}/admissions/admin/ranking/${selectedMajor}/publish-benchmark/`, {
        method: 'POST'
      });
      const data = await res.json();
      setMessage({ text: `Đã công bố ${data.published_benchmarks} điểm chuẩn cho năm ${data.year}.`, type: 'success' });
    } catch (err) {
      setMessage({ text: 'Lỗi khi công bố điểm chuẩn.', type: 'error' });
    }
  };

  const selectedMajorObj = majors.find(m => m.id === selectedMajor);

  const handleExportCSV = async () => {
    if (!selectedMajor) return;
    try {
      const res = await authFetch(`${API_BASE}/admissions/admin/ranking/${selectedMajor}/export-csv/`);
      if (!res.ok) throw new Error('Failed to export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Danh_Sach_Trung_Tuyen_${selectedMajorObj?.code || 'X'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMessage({ text: 'Lỗi khi xuất danh sách trúng tuyển.', type: 'error' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-sans text-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Xét tuyển & Lọc ảo</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý danh sách trúng tuyển dựa trên chỉ tiêu và điểm số.</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
            onClick={runRanking}
            disabled={running || publishing}
          >
            {running ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
            Chạy lọc ảo
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            onClick={publishResults}
            disabled={publishing || running || ranking.length === 0}
          >
            {publishing ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
            Công bố kết quả
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            onClick={publishBenchmark}
            disabled={publishing || running || ranking.length === 0}
          >
            Chốt điểm chuẩn
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            onClick={handleExportCSV}
            title="Xuất CSV danh sách trúng tuyển"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-slate-50 text-slate-800 border border-slate-200' : 'bg-red-50 text-red-800 border border-red-100'}`}>
          <Info size={18} />
          {message.text}
        </div>
      )}

      {/* Filter & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-6">
          <div className="flex-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Chọn ngành xét tuyển</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
              value={selectedMajor}
              onChange={(e) => {
                setSelectedMajor(e.target.value);
                setRanking([]); // Reset ranking when major changes
                setMessage({ text: '', type: '' });
              }}
            >
              {majors.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
            </select>
          </div>
          <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
          <div className="hidden md:block">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chỉ tiêu</div>
            <div className="text-xl font-bold">{selectedMajorObj?.quota || 0}</div>
          </div>
          <div className="hidden md:block">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đăng ký</div>
            <div className="text-xl font-bold">{ranking.length || '-'}</div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-lg p-5 flex flex-col justify-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dự kiến trúng tuyển</div>
          <div className="text-2xl font-bold">{ranking.filter(r => r.status === 'ACCEPTED').length}</div>
          <div className="text-[10px] text-slate-400 mt-1 italic">* Dựa trên chỉ tiêu và điểm sàn dự kiến.</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Hạng</th>
                <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Thí sinh</th>
                <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Phương thức</th>
                <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-center">Tổng điểm</th>
                <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-400"><Loader className="animate-spin mx-auto mb-2" /> Đang tải...</td></tr>
              ) : ranking.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-400">Nhấn "Chạy lọc ảo" để xem danh sách xếp hạng.</td></tr>
              ) : (
                ranking.map((res, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${res.status === 'ACCEPTED' ? '' : 'opacity-60'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {idx < 3 && <Trophy size={14} className="text-amber-500" />}
                        <span className="font-mono font-bold text-slate-400">#{idx + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{res.candidate_name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{res.cccd}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded">{res.method}</span>
                      <span className="ml-2 text-xs text-slate-400">{res.combination}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-base font-bold text-slate-900">{res.score.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {res.status === 'ACCEPTED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                          <UserCheck size={12} /> Trúng tuyển
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider">
                          <UserX size={12} /> Không đạt
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
