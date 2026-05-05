import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, BookOpen, Layers, Target, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';

export default function Catalogs() {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('majors');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data
  const [majors, setMajors] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [methods, setMethods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [benchmarkYear, setBenchmarkYear] = useState(null);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
    return res;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resMajors, resCombs, resBenchmarks, resCatalogs] = await Promise.all([
        authFetch(`${API_BASE}/admissions/admin/majors/`),
        authFetch(`${API_BASE}/admissions/admin/combinations/`),
        authFetch(`${API_BASE}/admissions/admin/benchmarks/`),
        authFetch(`${API_BASE}/admissions/catalogs/`)
      ]);
      
      setMajors(await resMajors.json());
      setCombinations(await resCombs.json());
      const benchmarksData = await resBenchmarks.json();
      setBenchmarks(benchmarksData);
      
      // Set default benchmarkYear to most recent year
      if (benchmarksData.length > 0 && !benchmarkYear) {
        const years = [...new Set(benchmarksData.map(b => b.year))].sort((a, b) => b - a);
        setBenchmarkYear(years[0]);
      }
      
      const catalogsData = await resCatalogs.json();
      setMethods(catalogsData.methods || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let url = '';
    if (activeTab === 'majors') {
      url = editingItem ? `${API_BASE}/admissions/admin/majors/${editingItem.id}/` : `${API_BASE}/admissions/admin/majors/`;
    } else if (activeTab === 'combinations') {
      url = editingItem ? `${API_BASE}/admissions/admin/combinations/${editingItem.id}/` : `${API_BASE}/admissions/admin/combinations/`;
    } else if (activeTab === 'benchmarks') {
      url = editingItem ? `${API_BASE}/admissions/admin/benchmarks/${editingItem.id}/` : `${API_BASE}/admissions/admin/benchmarks/`;
    }
    
    try {
      setSaving(true);
      const res = await authFetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        if (activeTab === 'majors') {
          setMajors(prev => editingItem ? prev.map(m => m.id === data.id ? data : m) : [...prev, data]);
        } else if (activeTab === 'combinations') {
          setCombinations(prev => editingItem ? prev.map(c => c.id === data.id ? data : c) : [...prev, data]);
        } else if (activeTab === 'benchmarks') {
          setBenchmarks(prev => editingItem ? prev.map(b => b.id === data.id ? data : b) : [...prev, data]);
        }
        setIsModalOpen(false);
        setFormData({});
        setEditingItem(null);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Có lỗi xảy ra!');
      }
    } catch (err) { console.error(err); }
    finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá mục này?')) return;
    let url = '';
    if (activeTab === 'majors') url = `${API_BASE}/admissions/admin/majors/${id}/`;
    else if (activeTab === 'combinations') url = `${API_BASE}/admissions/admin/combinations/${id}/`;
    else if (activeTab === 'benchmarks') url = `${API_BASE}/admissions/admin/benchmarks/${id}/`;
    
    try {
      const res = await authFetch(url, { method: 'DELETE' });
      if (res.ok) {
        if (activeTab === 'majors') setMajors(prev => prev.filter(m => m.id !== id));
        else if (activeTab === 'combinations') setCombinations(prev => prev.filter(c => c.id !== id));
        else if (activeTab === 'benchmarks') setBenchmarks(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) { console.error(err); }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const filteredMajors = majors.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCombs = combinations.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredBenchmarks = benchmarks
    .filter(b => benchmarkYear ? b.year === benchmarkYear : true)
    .filter(b => b.major_name?.toLowerCase().includes(searchTerm.toLowerCase()) || b.year.toString().includes(searchTerm));
  const benchmarkYears = [...new Set(benchmarks.map(b => b.year))].sort((a, b) => b - a);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-sans text-slate-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Quản lý Danh mục</h2>
          <p className="text-slate-500 text-sm mt-1">Cấu hình ngành học, tổ hợp môn và điểm chuẩn các năm</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
          onClick={() => openModal()}
        >
          <Plus size={16} /> 
          {activeTab === 'majors' ? 'Thêm ngành mới' : activeTab === 'combinations' ? 'Thêm tổ hợp mới' : 'Thêm điểm chuẩn'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit mb-6">
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'majors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('majors')}
        >
          <BookOpen size={16} /> Ngành học
        </button>
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'combinations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('combinations')}
        >
          <Layers size={16} /> Tổ hợp môn
        </button>
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'benchmarks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('benchmarks')}
        >
          <Target size={16} /> Điểm chuẩn
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="relative w-72">
            <input 
              type="text" 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
              placeholder="Tìm kiếm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Year selector for benchmarks */}
        {activeTab === 'benchmarks' && benchmarkYears.length > 0 && (
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {benchmarkYears.map(y => (
                <button
                  key={y}
                  onClick={() => setBenchmarkYear(y)}
                  className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors border ${
                    benchmarkYear === y
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-500">
              <span className="font-bold text-slate-700">{filteredBenchmarks.length}</span> mục điểm chuẩn
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-slate-400"><Loader className="animate-spin mx-auto mb-2" /> Đang tải...</div>
          ) : activeTab === 'majors' ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Mã ngành</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Tên ngành</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Chỉ tiêu</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMajors.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-600">{m.code}</td>
                    <td className="px-6 py-4 font-medium">{m.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded">{m.quota}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors" onClick={() => openModal(m)}><Edit2 size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-red-600 transition-colors" onClick={() => handleDelete(m.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'combinations' ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Mã tổ hợp</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Môn 1</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Môn 2</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Môn 3</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCombs.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-600">{c.code}</td>
                    <td className="px-6 py-4">{c.subject1}</td>
                    <td className="px-6 py-4">{c.subject2}</td>
                    <td className="px-6 py-4">{c.subject3}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-red-600 transition-colors" onClick={() => handleDelete(c.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Năm</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Ngành</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Phương thức</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Điểm chuẩn</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBenchmarks.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-600">{b.year}</td>
                    <td className="px-6 py-4 font-medium">{b.major_name}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{b.method_name}</td>
                    <td className="px-6 py-4 font-bold">{b.score}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors" onClick={() => openModal(b)}><Edit2 size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-red-600 transition-colors" onClick={() => handleDelete(b.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-900">{editingItem ? 'Cập nhật' : 'Thêm mới'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {activeTab === 'majors' ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Mã ngành</label>
                      <input type="text" className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} required disabled={!!editingItem} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Tên ngành</label>
                      <input type="text" className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Chỉ tiêu xét tuyển</label>
                      <input type="number" className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" value={formData.quota || ''} onChange={e => setFormData({...formData, quota: e.target.value})} required />
                    </div>
                  </>
                ) : activeTab === 'combinations' ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Mã tổ hợp (VD: A00)</label>
                      <input type="text" className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <input type="text" className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" placeholder="Môn 1" value={formData.subject1 || ''} onChange={e => setFormData({...formData, subject1: e.target.value})} required />
                      </div>
                      <div>
                        <input type="text" className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" placeholder="Môn 2" value={formData.subject2 || ''} onChange={e => setFormData({...formData, subject2: e.target.value})} required />
                      </div>
                      <div>
                        <input type="text" className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" placeholder="Môn 3" value={formData.subject3 || ''} onChange={e => setFormData({...formData, subject3: e.target.value})} required />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Ngành</label>
                      <select className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" value={formData.major || ''} onChange={e => setFormData({...formData, major: e.target.value})} required>
                        <option value="">Chọn ngành...</option>
                        {majors.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Phương thức</label>
                      <select className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" value={formData.method || ''} onChange={e => setFormData({...formData, method: e.target.value})} required>
                        <option value="">Chọn phương thức...</option>
                        {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Năm</label>
                        <input type="number" className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" value={formData.year || ''} onChange={e => setFormData({...formData, year: e.target.value})} required />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Điểm chuẩn</label>
                        <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" value={formData.score || ''} onChange={e => setFormData({...formData, score: e.target.value})} required />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-all">Hủy</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50">
                  {saving ? 'Đang lưu...' : 'Lưu dữ liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
