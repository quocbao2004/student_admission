import { useState, useEffect } from 'react';
import { Settings, Save, Info, Loader, Calculator, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { API_BASE } from '../../config';

const FormulaItem = ({ method, existingFormula, onSave, savingGlobal }) => {
  const [formula, setFormula] = useState(existingFormula?.formula || '');

  const appendVariable = (v) => {
    setFormula(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + v + ' ');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
            <Calculator size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">{method.name}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID: {method.id.split('-')[0]}</span>
          </div>
        </div>
        {existingFormula && (
          <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-md border border-green-100 uppercase tracking-tighter">Đã thiết lập</span>
        )}
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Biểu thức tính toán (Python Expression)</label>
          <div className="relative group">
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-900 text-blue-300 font-mono text-base rounded-xl border-2 border-transparent focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner" 
              placeholder="VD: s1 + s2 + s3 + bonus"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
               Trình soạn thảo
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mr-2">Chèn biến số:</span>
          {[
            { label: 'Môn 1 (s1)', val: 's1' },
            { label: 'Môn 2 (s2)', val: 's2' },
            { label: 'Môn 3 (s3)', val: 's3' },
            { label: 'Ưu tiên (bonus)', val: 'bonus' },
            { label: 'T.Bình (avg)', val: 'avg' },
          ].map(b => (
            <button 
              key={b.val}
              onClick={() => appendVariable(b.val)}
              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 italic">
            <Info size={14} />
            Hệ thống sử dụng Python engine để tính toán. Đảm bảo công thức hợp lệ.
          </div>
          <button 
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-slate-200 disabled:opacity-50"
            disabled={savingGlobal}
            onClick={() => {
              if (!formula.trim()) {
                alert('Vui lòng nhập công thức (không được để trống) trước khi lưu!');
                return;
              }
              onSave(method.id, formula, existingFormula?.id);
            }}
          >
            {savingGlobal ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Formulas() {
  const { token, logout } = useAuth();
  const [methods, setMethods] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (res.status === 401) { logout(); return; }
    return res;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const resMethods = await authFetch(`${API_BASE}/admissions/catalogs/`);
      const resFormulas = await authFetch(`${API_BASE}/admissions/admin/formulas/`);
      if (!resMethods || !resFormulas) return;
      const catData = await resMethods.json();
      setMethods(catData.methods);
      setFormulas(await resFormulas.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateFormula = async (methodId, formulaText, existingId) => {
    if (!formulaText.trim()) {
      alert('Công thức không được để trống!');
      return;
    }
    try {
      setSaving(true);
      const url = existingId ? `${API_BASE}/admissions/admin/formulas/${existingId}/` : `${API_BASE}/admissions/admin/formulas/`;
      const res = await authFetch(url, {
        method: existingId ? 'PUT' : 'POST',
        body: JSON.stringify({
          method: methodId,
          formula: formulaText
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert('Đã cập nhật công thức thành công!');
        setFormulas(prev => {
          const existingIndex = prev.findIndex(f => f.id === data.id || f.method === data.method);
          if (existingIndex >= 0) {
            const next = [...prev];
            next[existingIndex] = data;
            return next;
          }
          return [...prev, data];
        });
      }
    } catch (err) { alert('Lỗi: ' + err.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader className="animate-spin text-blue-500" size={32} />
      <span className="text-sm text-slate-400 font-medium font-mono uppercase tracking-[0.2em]">Cấu hình đang tải...</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Thiết lập công thức xét tuyển</h2>
          <p className="text-slate-500 font-medium">Định nghĩa biểu thức toán học để tính điểm tự động cho từng phương thức.</p>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
           <Calculator className="text-blue-500" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-2">
          {methods.map(m => (
            <FormulaItem 
              key={m.id}
              method={m}
              existingFormula={formulas.find(f => f.method === m.id)}
              onSave={handleUpdateFormula}
              savingGlobal={saving}
            />
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            <h6 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Info size={16} /> Quy chuẩn kỹ thuật
            </h6>
            <div className="space-y-6">
              <p className="text-sm text-slate-300 leading-relaxed font-medium">Hệ thống biên dịch chuỗi công thức thành mã Python thực thi được.</p>
              
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest px-2 py-0.5 bg-white/10 rounded">Biến số khả dụng (Context)</span>
                <ul className="text-sm text-slate-400 space-y-3 ps-1">
                  <li className="flex items-start gap-2"><code className="text-blue-300 bg-blue-900/40 px-1.5 rounded">s1,s2,s3</code> <span>Điểm các môn tương ứng trong tổ hợp.</span></li>
                  <li className="flex items-start gap-2"><code className="text-blue-300 bg-blue-900/40 px-1.5 rounded">bonus</code> <span>Điểm cộng ưu tiên của thí sinh.</span></li>
                  <li className="flex items-start gap-2"><code className="text-blue-300 bg-blue-900/40 px-1.5 rounded">avg</code> <span>Trung bình cộng (môn 1, 2, 3).</span></li>
                </ul>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 italic text-xs text-slate-400 space-y-2">
                <div className="flex gap-2 items-center text-white/70 not-italic font-bold"><AlertCircle size={14} /> Lưu ý an toàn:</div>
                Chỉ sử dụng các phép toán cơ bản. Hệ thống ngăn chặn các lệnh truy cập hệ thống bẩn.
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Các ví dụ mẫu</h6>
            <div className="space-y-4">
              {[
                { title: 'Cơ bản', exp: 's1 + s2 + s3 + bonus' },
                { title: 'Nhân hệ số 2', exp: '(s1*2 + s2 + s3)*3/4 + bonus' },
                { title: 'Dùng TB cộng', exp: 'avg * 3 + bonus' },
              ].map(ex => (
                <div key={ex.title} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 mb-1">{ex.title}</div>
                  <code className="text-blue-600 text-xs font-bold leading-none">{ex.exp}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
