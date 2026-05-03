import { useState, useEffect } from 'react';
import { Play, Trophy, UserX, UserCheck, Loader, Send, Info, Download, Check, BarChart2, Target, AlertTriangle, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';

// --- Step 1: Chạy lọc ảo
// --- Step 2: Công bố kết quả (chỉ enable sau khi đã chạy ranking)
// --- Step 3: Chốt điểm chuẩn (chỉ enable sau khi đã công bố)
// --- Step 4: Xuất CSV (luôn enable khi đã chạy xong)

const WORKFLOW_STEPS = [
  { id: 1, label: 'Chạy lọc ảo', description: 'Tính điểm & xếp hạng' },
  { id: 2, label: 'Công bố kết quả', description: 'Cập nhật trạng thái thí sinh' },
  { id: 3, label: 'Chốt điểm chuẩn', description: 'Lưu benchmark năm nay' },
  { id: 4, label: 'Gửi email', description: 'Thông báo kết quả đến thí sinh' },
  { id: 5, label: 'Xuất CSV', description: 'Tải danh sách trúng tuyển' },
];

const ADMISSION_YEAR = new Date().getFullYear();

function WorkflowStepper({ currentStep }) {
  return (
    <div className="flex items-center gap-0">
      {WORKFLOW_STEPS.map((step, idx) => {
        const done = currentStep > step.id;
        const active = currentStep === step.id;
        return (
          <div key={step.id} className="flex items-center gap-0 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                done
                  ? 'bg-[#027A48] border-[#027A48] text-white'
                  : active
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {done ? <Check size={14} /> : step.id}
              </div>
              <div className={`text-center hidden sm:block ${active ? 'block' : ''}`}>
                <div className={`text-[11px] font-bold whitespace-nowrap ${
                  done ? 'text-[#027A48]' : active ? 'text-slate-900' : 'text-slate-400'
                }`}>{step.label}</div>
                <div className="text-[9px] text-slate-400 whitespace-nowrap leading-tight">{step.description}</div>
              </div>
            </div>
            {idx < WORKFLOW_STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 mt-[-16px] ${done ? 'bg-[#027A48]' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TooltipWrapper({ tooltip, children }) {
  return (
    <div className="relative group inline-block">
      {children}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

export default function Admissions() {
  const { token, logout } = useAuth();
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [toast, setToast] = useState(null);

  // Workflow step tracking per major (in-session)
  const [workflowState, setWorkflowState] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const majorWorkflow = workflowState[selectedMajor] || {};
  const hasRanked = !!majorWorkflow.ranked;
  const hasPublished = !!majorWorkflow.published;
  const hasBenchmarked = !!majorWorkflow.benchmarked;
  const hasEmailSent = !!majorWorkflow.emailSent;

  // Fix: chốt điểm chuẩn chỉ cần đã chạy ranking (hasRanked), không cần phải publish trước
  // Derive current workflow step (1-5)
  const currentStep = hasEmailSent ? 5 : hasBenchmarked ? 4 : hasPublished ? 3 : hasRanked ? 2 : 1;

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

  const updateWorkflow = (majorId, patch) => {
    setWorkflowState(prev => ({
      ...prev,
      [majorId]: { ...(prev[majorId] || {}), ...patch }
    }));
  };

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${API_BASE}/admissions/admin/majors/`);
        const data = await res.json();
        setMajors(data);
        if (data.length > 0) setSelectedMajor(data[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMajors();
  }, []);

  useEffect(() => {
    const fetchWorkflowStatus = async () => {
      if (!selectedMajor) return;
      try {
        const res = await authFetch(`${API_BASE}/admissions/admin/ranking/${selectedMajor}/workflow-status/`);
        if (res.ok) {
          const data = await res.json();
          updateWorkflow(selectedMajor, {
            ranked: data.has_ranked,
            published: data.has_published,
            benchmarked: data.has_benchmarked,
            emailSent: data.has_email_sent
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải trạng thái workflow:", err);
      }
    };
    fetchWorkflowStatus();
  }, [selectedMajor]);

  const handleMajorChange = (majorId) => {
    setSelectedMajor(majorId);
    setRanking([]);
  };

  const runRanking = async () => {
    if (!selectedMajor) return;
    setRunning(true);
    try {
      const res = await authFetch(`${API_BASE}/admissions/admin/ranking/${selectedMajor}/`);
      const data = await res.json();
      setRanking(data);
      updateWorkflow(selectedMajor, { ranked: true });
      showToast(`Đã xếp hạng ${data.length} thí sinh. Kiểm tra danh sách bên dưới.`);
    } catch (err) {
      showToast('Lỗi khi chạy lọc ảo.', 'error');
    } finally {
      setRunning(false);
    }
  };

  const publishResults = async () => {
    if (!selectedMajor) return;
    if (!window.confirm('Bạn có chắc chắn muốn công bố kết quả? Hành động này sẽ thay đổi trạng thái hồ sơ của tất cả thí sinh liên quan và không thể hoàn tác dễ dàng.')) return;
    setPublishing(true);
    try {
      const res = await authFetch(`${API_BASE}/admissions/admin/ranking/${selectedMajor}/publish/`, {
        method: 'POST'
      });
      const data = await res.json();
      updateWorkflow(selectedMajor, { published: true });
      showToast(`Đã công bố kết quả cho ${data.published_count} thí sinh.`);
    } catch (err) {
      showToast('Lỗi khi công bố kết quả.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const publishBenchmark = async () => {
    if (!selectedMajor) return;
    if (!window.confirm('Chốt điểm chuẩn cho năm nay dựa trên danh sách trúng tuyển hiện tại?')) return;
    try {
      const res = await authFetch(`${API_BASE}/admissions/admin/ranking/${selectedMajor}/publish-benchmark/`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
      updateWorkflow(selectedMajor, { benchmarked: true });
      showToast(`Đã chốt ${data.published_benchmarks} điểm chuẩn cho năm ${data.year}.`);
    } catch (err) {
      showToast('Lỗi khi chốt điểm chuẩn: ' + err.message, 'error');
    }
  };

  const sendAdmissionEmails = async () => {
    if (!selectedMajor) return;
    const acceptedCount = ranking.filter(r => r.status === 'ACCEPTED').length;
    if (!window.confirm(`Xác nhận gửi email thông báo kết quả xét tuyển đến tất cả thí sinh trong ngành này?\n\nTrúng tuyển: ${acceptedCount} thí sinh\nKhông đạt: ${ranking.length - acceptedCount} thí sinh`)) return;
    try {
      setSendingEmails(true);
      const res = await authFetch(`${API_BASE}/admissions/admin/ranking/${selectedMajor}/send-emails/`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
      updateWorkflow(selectedMajor, { emailSent: true });
      showToast(`Đã gửi ${data.sent_count} email thành công${data.failed_count > 0 ? `, ${data.failed_count} thất bại` : ''}.`);
    } catch (err) {
      showToast('Lỗi gửi email: ' + err.message, 'error');
    } finally {
      setSendingEmails(false);
    }
  };

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
      showToast('Đã xuất danh sách CSV thành công.');
    } catch (err) {
      showToast('Lỗi khi xuất danh sách trúng tuyển.', 'error');
    }
  };

  const selectedMajorObj = majors.find(m => m.id === selectedMajor);
  const acceptedCount = ranking.filter(r => r.status === 'ACCEPTED').length;

  const anyLoading = running || publishing || sendingEmails;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans text-slate-900 space-y-8 relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl border flex items-center gap-3
          ${toast.type === 'error' ? 'bg-white border-red-100 text-red-600' : 'bg-slate-900 border-slate-800 text-white'}`}
        >
          {toast.type === 'error' ? <AlertTriangle size={18}/> : <Check size={18} className="text-emerald-400"/>}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Xét tuyển & Lọc ảo — Năm {ADMISSION_YEAR}</h2>
          <p className="text-slate-500 text-sm mt-1">Thực hiện tuần tự từng bước để hoàn tất quy trình xét tuyển cho từng ngành.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Năm tuyển sinh</span>
          <span className="text-sm font-bold text-slate-900">{ADMISSION_YEAR}</span>
        </div>
      </div>

      {/* Major selector + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-6 shadow-sm">
          <div className="flex-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Chọn ngành xét tuyển</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
              value={selectedMajor}
              onChange={(e) => handleMajorChange(e.target.value)}
            >
              {majors.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="text-center">
              <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Chỉ tiêu</div>
              <div className="text-2xl font-bold text-slate-900">{selectedMajorObj?.quota ?? '—'}</div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Đã xếp hạng</div>
              <div className="text-2xl font-bold text-slate-900">{ranking.length > 0 ? ranking.length : '—'}</div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Trúng tuyển</div>
              <div className="text-2xl font-bold text-[#027A48]">{ranking.length > 0 ? acceptedCount : '—'}</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-2">Tiến độ quy trình</div>
          <div className="text-4xl font-bold mb-1">
            {currentStep - 1}<span className="text-slate-500 text-2xl">/{WORKFLOW_STEPS.length}</span>
          </div>
          <div className="text-xs text-slate-400">
            {currentStep === 1 && `Chưa bắt đầu — Chạy lọc ảo năm ${ADMISSION_YEAR} trước`}
            {currentStep === 2 && `Đã xếp hạng năm ${ADMISSION_YEAR} — Công bố kết quả và chốt điểm chuẩn`}
            {currentStep === 3 && `Đã công bố năm ${ADMISSION_YEAR} — Tiếp tục chốt điểm chuẩn`}
            {currentStep === 4 && `Đã chốt chuẩn năm ${ADMISSION_YEAR} — Gửi email thông báo cho thí sinh`}
            {currentStep === 5 && `✓ Hoàn tất năm ${ADMISSION_YEAR} — Có thể xuất CSV`}
          </div>
        </div>
      </div>

      {/* Workflow Stepper Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Stepper header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/40">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Quy trình 4 bước bắt buộc — Năm {ADMISSION_YEAR}</div>
          <WorkflowStepper currentStep={currentStep} />
        </div>

        {/* Step action row */}
        <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">

          {/* Step 1 */}
          <TooltipWrapper tooltip={null}>
            <button
              onClick={runRanking}
              disabled={anyLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {running ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
              {hasRanked ? 'Chạy lại lọc ảo' : 'Chạy lọc ảo'}
            </button>
          </TooltipWrapper>

          <div className="w-px h-8 bg-slate-200 hidden sm:block" />

          {/* Step 2: Công bố kết quả */}
          <TooltipWrapper tooltip={!hasRanked ? 'Cần chạy lọc ảo trước.' : null}>
            <button
              onClick={publishResults}
              disabled={anyLoading || !hasRanked}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg shadow-sm transition-colors border ${
                hasRanked
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              {publishing ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
              Công bố kết quả
            </button>
          </TooltipWrapper>

          {/* Step 3: Chốt điểm chuẩn — chỉ cần hasRanked */}
          <TooltipWrapper tooltip={!hasRanked ? 'Cần chạy lọc ảo trước.' : null}>
            <button
              onClick={publishBenchmark}
              disabled={anyLoading || !hasRanked}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg shadow-sm transition-colors border ${
                hasRanked
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <BarChart2 size={16} />
              Chốt điểm chuẩn
            </button>
          </TooltipWrapper>

          <div className="w-px h-8 bg-slate-200 hidden sm:block" />

          {/* Step 4: Gửi email */}
          <TooltipWrapper tooltip={!hasRanked ? 'Cần chạy lọc ảo trước khi gửi email.' : null}>
            <button
              onClick={sendAdmissionEmails}
              disabled={anyLoading || !hasRanked}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg shadow-sm transition-colors border ${
                hasRanked
                  ? hasEmailSent
                    ? 'bg-[#ECFDF3] border-[#D1FADF] text-[#027A48] hover:bg-[#D1FADF]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              {sendingEmails ? <Loader className="animate-spin" size={16} /> : <Mail size={16} />}
              {hasEmailSent ? 'Gửi lại email' : 'Gửi email kết quả'}
            </button>
          </TooltipWrapper>

          <div className="w-px h-8 bg-slate-200 hidden sm:block" />

          {/* Step 5: Xuất CSV */}
          <TooltipWrapper tooltip={!hasRanked ? 'Chạy lọc ảo trước để có dữ liệu xuất.' : null}>
            <button
              onClick={handleExportCSV}
              disabled={!hasRanked}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg shadow-sm transition-colors border ${
                hasRanked
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Download size={16} />
              Xuất CSV
            </button>
          </TooltipWrapper>

          {/* Workflow completion indicator */}
          {hasBenchmarked && (
            <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#ECFDF3] text-[#027A48] border border-[#D1FADF] rounded-lg text-sm font-bold">
              <Check size={16} /> Quy trình hoàn tất
            </div>
          )}
        </div>

        {/* Info note for current step */}
        {!hasEmailSent && (
          <div className={`mx-6 mb-5 px-4 py-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
            currentStep === 1 ? 'bg-blue-50 text-blue-700 border-blue-100'
            : currentStep === 2 ? 'bg-amber-50 text-amber-700 border-amber-100'
            : currentStep === 3 ? 'bg-purple-50 text-purple-700 border-purple-100'
            : 'bg-teal-50 text-teal-700 border-teal-100'
          }`}>
            <Info size={14} />
            {currentStep === 1 && 'Bước 1: Chọn ngành và nhấn "Chạy lọc ảo" để hệ thống tính điểm và xếp hạng tự động.'}
            {currentStep === 2 && 'Bước 2: Kiểm tra danh sách, sau đó "Công bố kết quả" và "Chốt điểm chuẩn" (có thể thực hiện song song).'}
            {currentStep === 3 && 'Bước 3: Đã công bố kết quả. Hãy "Chốt điểm chuẩn" để lưu điểm sàn chính thức.'}
            {currentStep === 4 && 'Bước 4: Nhấn "Gửi email kết quả" để thông báo đến tất cả thí sinh đăng ký ngành này.'}
          </div>
        )}
      </div>

      {/* Ranking Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">
              Danh sách xếp hạng — {selectedMajorObj?.name || '...'}
            </h3>
          </div>
          {ranking.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#027A48] inline-block"></span> Trúng tuyển: {acceptedCount}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span> Không đạt: {ranking.length - acceptedCount}
              </span>
            </div>
          )}
        </div>
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
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Target size={32} className="opacity-20" />
                      <span className="font-medium">Nhấn "Chạy lọc ảo" để xem danh sách xếp hạng.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                ranking.map((res, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${res.status === 'ACCEPTED' ? '' : 'opacity-50'}`}>
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
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ECFDF3] text-[#027A48] border border-[#D1FADF] text-[10px] font-bold rounded-full uppercase tracking-wider">
                          <UserCheck size={12} /> Trúng tuyển
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
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
