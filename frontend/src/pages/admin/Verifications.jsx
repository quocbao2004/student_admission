import { useState, useEffect } from 'react';
import { Check, X, Search, Loader, User, FileText, AlertTriangle, Eye, ArrowLeft, CreditCard, Layers, Download, FileCheck, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = 'http://localhost:8000/api';

export default function Verifications() {
  const { token, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  
  // UI States
  const [previewDoc, setPreviewDoc] = useState(null); // Document for Quick View Modal
  const [docRejectionId, setDocRejectionId] = useState(null);
  const [docRejectionReason, setDocRejectionReason] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (res.status === 401) {
      logout();
      throw new Error('Phiên đăng nhập hết hạn.');
    }
    return res;
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/admissions/admin/profiles/?year=${filterYear}`);
      const data = await res.json();
      setProfiles(data);
      if (data.length > 0) {
        handleSelectProfile(data[0]);
      } else {
        setSelectedProfile(null);
      }
    } catch (err) {
      showToast('Lỗi tải dữ liệu hồ sơ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [filterYear]);

  const handleSelectProfile = (p) => {
    setSelectedProfile(p);
    setRejectionReason('');
    setDocRejectionId(null);
    setPreviewDoc(null);
  };

  // --- Workflow stepper derived state ---
  const step1Done = selectedProfile?.payment_status === 'SUCCESS';
  const totalDocs = selectedProfile?.documents?.length ?? 0;
  const verifiedDocs = selectedProfile?.documents?.filter(d => d.status === 'VERIFIED').length ?? 0;
  const step2Done = totalDocs > 0 && verifiedDocs === totalDocs;
  const canApprove = step1Done && step2Done;

  const handleVerify = async (status) => {
    if (!selectedProfile) return;
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối hồ sơ.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const res = await authFetch(`${API_BASE}/admissions/admin/profiles/${selectedProfile.id}/verify/`, {
        method: 'POST',
        body: JSON.stringify({
          status,
          rejection_reason: rejectionReason
        })
      });
      const updated = await res.json();
      
      setProfiles(profiles.map(p => p.id === updated.id ? updated : p));
      setSelectedProfile(updated);
      setRejectionReason('');
      showToast(status === 'VERIFIED' ? 'Đã duyệt hồ sơ thành công!' : 'Đã từ chối hồ sơ.');
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedProfile) return;
    if (!window.confirm(`Xác nhận đã nhận đủ lệ phí từ thí sinh ${selectedProfile.full_name}?`)) return;

    try {
      setActionLoading(true);
      const res = await authFetch(`${API_BASE}/admissions/admin/profiles/${selectedProfile.id}/confirm-payment/`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Lỗi không xác định');
      }

      const updated = await res.json();
      setProfiles(profiles.map(p => p.id === updated.id ? updated : p));
      setSelectedProfile(updated);
      showToast('Xác nhận thanh toán thành công!');
    } catch (err) {
      showToast('Lỗi xác nhận thanh toán: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmRejectDocument = async () => {
    if (!docRejectionReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối', 'error');
      return;
    }
    await processVerifyDocument(docRejectionId, 'REJECTED', docRejectionReason);
    setDocRejectionId(null);
    setDocRejectionReason('');
  };

  const processVerifyDocument = async (docId, status, reason = '') => {
    try {
      setActionLoading(true);
      const res = await authFetch(`${API_BASE}/admissions/admin/documents/${docId}/verify/`, {
        method: 'POST',
        body: JSON.stringify({ status, reason })
      });
      const updatedDoc = await res.json();
      if (!res.ok) throw new Error(updatedDoc.error || 'Không thể duyệt tài liệu');

      setSelectedProfile(prev => ({
        ...prev,
        documents: prev.documents.map(doc => doc.id === updatedDoc.id ? { ...doc, ...updatedDoc } : doc)
      }));
      setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? {
        ...p,
        documents: p.documents.map(doc => doc.id === updatedDoc.id ? { ...doc, ...updatedDoc } : doc)
      } : p));
      
      // Update preview doc state if open
      if (previewDoc && previewDoc.id === docId) {
        setPreviewDoc({ ...previewDoc, ...updatedDoc });
      }

      showToast(status === 'VERIFIED' ? 'Đã duyệt tài liệu hợp lệ' : 'Đã từ chối tài liệu');
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchSearch = (p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.cccd?.includes(searchTerm));
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED': return <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-[#ECFDF3] text-[#027A48] border border-[#D1FADF]"><Check size={10}/> Đã duyệt</span>;
      case 'REJECTED': return <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-[#FEF3F2] text-[#B42318] border border-[#FEE4E2]"><X size={10}/> Từ chối</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-[#FFFAEB] text-[#B54708] border border-[#FEF0C7]"><Loader size={10} className="animate-spin"/> Chờ duyệt</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Global Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate__animated animate__fadeInRight
          ${toast.type === 'error' ? 'bg-white border-red-100 text-red-600' : 'bg-slate-900 border-slate-800 text-white'}`}
        >
          {toast.type === 'error' ? <AlertTriangle size={18}/> : <Check size={18} className="text-emerald-400"/>}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hậu kiểm & Duyệt Hồ sơ</h2>
          <p className="text-sm text-slate-500">Đối soát thông tin tổng thể và thẩm định minh chứng — <span className="font-bold text-slate-700">Năm {filterYear}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Năm tuyển sinh</label>
            <select
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tổng số hồ sơ</span>
            <div className="text-2xl font-bold text-slate-900">{profiles.length}</div>
          </div>
        </div>
      </div>
      
      {/* Main 2-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden min-h-0">
        
        {/* COLUMN 1: Profiles List (Fixed Width or 30%) */}
        <div className="w-full lg:w-[350px] flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm h-[85vh] flex-shrink-0">
          <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
                placeholder="Tìm tên, CCCD..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING_VERIFY', 'VERIFIED', 'REJECTED'].map(s => (
                <button 
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors border ${
                    filterStatus === s 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s === 'ALL' ? 'Tất cả' : s === 'PENDING_VERIFY' ? 'Chờ duyệt' : s === 'VERIFIED' ? 'Đã duyệt' : 'Từ chối'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 divide-y divide-slate-50 custom-scrollbar">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse flex flex-col gap-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic">Không tìm thấy hồ sơ nào</div>
            ) : (
              filteredProfiles.map(p => (
                <div 
                  key={p.id} 
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-all group ${selectedProfile?.id === p.id ? 'bg-slate-50 border-l-4 border-l-slate-900' : 'border-l-4 border-l-transparent'}`}
                  onClick={() => handleSelectProfile(p)}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="font-bold text-slate-800 text-sm truncate max-w-[150px] leading-tight group-hover:text-slate-900">
                      {p.full_name || 'Chưa cập nhật'}
                    </div>
                    {getStatusBadge(p.status)}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-slate-500 font-mono tracking-wide">{p.cccd || '---'}</span>
                      <span className="text-[10px] text-slate-400 font-bold">Khóa {new Date(p.created_at).getFullYear()}</span>
                    </div>
                    {p.payment_status === 'SUCCESS' ? (
                      <span className="text-[9px] text-[#027A48] font-bold bg-[#ECFDF3] border border-[#D1FADF] px-1.5 py-0.5 rounded">ĐÃ NỘP PHÍ</span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">CHƯA NỘP</span>
                    )}
                  </div>
                  {/* Nguyện vọng đăng ký (Summary) */}
                  {p.applications && p.applications.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex flex-col gap-0.5">
                      {p.applications.slice(0, 2).map(app => (
                        <div key={app.id} className="flex justify-between items-center text-[10px] leading-tight">
                          <span className="font-bold text-slate-600 truncate max-w-[130px]">
                            {app.major_code} <span className="text-slate-400 font-normal">| {app.combination_code || '---'}</span>
                          </span>
                          <span className="text-slate-400 font-bold bg-slate-100 px-1 rounded">NV{app.priority_order}</span>
                        </div>
                      ))}
                      {p.applications.length > 2 && (
                        <div className="text-[9px] text-slate-400 font-bold italic mt-0.5">
                          + {p.applications.length - 2} nguyện vọng khác
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: Workspace (Flex-1) */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar gap-6 pr-2">
          {selectedProfile ? (
            <>
              {/* --- Section 1: Profile Header & Workflow Stepper --- */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Profile identity row */}
                <div className="p-5 flex items-center gap-4 border-b border-slate-100">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
                    <User size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 leading-tight truncate">{selectedProfile.full_name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">Năm {new Date(selectedProfile.created_at).getFullYear()}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full flex-shrink-0"></span>
                      <span className="truncate">{selectedProfile.email}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full flex-shrink-0"></span>
                      <span>{selectedProfile.phone}</span>
                    </div>
                  </div>
                  {/* Overall status badge */}
                  {(selectedProfile.status === 'VERIFIED' || selectedProfile.status === 'REJECTED') && (
                    <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      selectedProfile.status === 'VERIFIED'
                        ? 'bg-[#ECFDF3] text-[#027A48] border border-[#D1FADF]'
                        : 'bg-[#FEF3F2] text-[#B42318] border border-[#FEE4E2]'
                    }`}>
                      {selectedProfile.status === 'VERIFIED' ? <Check size={12}/> : <X size={12}/>}
                      {selectedProfile.status === 'VERIFIED' ? 'Đã phê duyệt' : 'Đã từ chối'}
                    </div>
                  )}
                </div>

                {/* 3-Step Workflow Progress Stepper */}
                <div className="px-5 py-4 bg-slate-50/60 border-b border-slate-100">
                  <div className="flex items-center gap-0">
                    {/* Step 1: Lệ phí */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border-2 ${
                        step1Done
                          ? 'bg-[#027A48] border-[#027A48] text-white'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}>
                        {step1Done ? <Check size={14}/> : '1'}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${step1Done ? 'text-[#027A48]' : 'text-slate-500'}`}>Lệ phí</div>
                        <div className="text-[10px] text-slate-400 leading-none">
                          {step1Done ? 'Đã xác nhận' : 'Chưa nộp phí'}
                        </div>
                      </div>
                    </div>

                    {/* Connector 1-2 */}
                    <div className={`flex-1 h-px mx-4 ${step1Done ? 'bg-[#027A48]' : 'bg-slate-200'}`}></div>

                    {/* Step 2: Minh chứng */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border-2 ${
                        step2Done
                          ? 'bg-[#027A48] border-[#027A48] text-white'
                          : totalDocs > 0 && verifiedDocs > 0
                          ? 'bg-amber-400 border-amber-400 text-white'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}>
                        {step2Done ? <Check size={14}/> : '2'}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${
                          step2Done ? 'text-[#027A48]' : totalDocs > 0 && verifiedDocs > 0 ? 'text-amber-600' : 'text-slate-500'
                        }`}>Minh chứng</div>
                        <div className="text-[10px] text-slate-400 leading-none">
                          {totalDocs === 0 ? 'Chưa có tài liệu' : `${verifiedDocs}/${totalDocs} đã duyệt`}
                        </div>
                      </div>
                    </div>

                    {/* Connector 2-3 */}
                    <div className={`flex-1 h-px mx-4 ${step2Done ? 'bg-[#027A48]' : 'bg-slate-200'}`}></div>

                    {/* Step 3: Phê duyệt hồ sơ */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border-2 ${
                        selectedProfile.status === 'VERIFIED'
                          ? 'bg-[#027A48] border-[#027A48] text-white'
                          : selectedProfile.status === 'REJECTED'
                          ? 'bg-[#B42318] border-[#B42318] text-white'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}>
                        {selectedProfile.status === 'VERIFIED' ? <Check size={14}/>
                          : selectedProfile.status === 'REJECTED' ? <X size={14}/>
                          : '3'}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${
                          selectedProfile.status === 'VERIFIED' ? 'text-[#027A48]'
                          : selectedProfile.status === 'REJECTED' ? 'text-[#B42318]'
                          : 'text-slate-500'
                        }`}>Phê duyệt</div>
                        <div className="text-[10px] text-slate-400 leading-none">
                          {selectedProfile.status === 'VERIFIED' ? 'Hoàn thành'
                            : selectedProfile.status === 'REJECTED' ? 'Đã từ chối'
                            : canApprove ? 'Sẵn sàng' : 'Chờ bước trên'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action row */}
                <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Payment confirm button (Step 1 guard) */}
                  {!step1Done && (
                    <button
                      onClick={handleConfirmPayment}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-slate-900 hover:bg-black text-white rounded-lg shadow-sm transition-colors"
                    >
                      {actionLoading ? <Loader className="animate-spin" size={15}/> : <CreditCard size={15}/>}
                      Xác nhận đã thu lệ phí
                    </button>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:ml-auto w-full sm:w-auto">
                  {selectedProfile.status === 'PENDING' || selectedProfile.status === 'PENDING_VERIFY' ? (
                    <>
                      <input 
                        type="text"
                        className="w-full sm:w-60 p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-slate-50" 
                        placeholder="Lý do từ chối (nếu có)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-slate-600 font-bold rounded-lg border border-slate-200 hover:bg-[#FEF3F2] hover:text-[#B42318] hover:border-[#FEE4E2] transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                          onClick={() => handleVerify('REJECTED')}
                          disabled={actionLoading}
                        >
                          <X size={15}/> Từ chối
                        </button>
                        <div className="relative group">
                          <button 
                            className={`flex-1 sm:flex-none px-6 py-2.5 font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 text-sm ${
                              canApprove
                                ? 'bg-slate-900 hover:bg-black text-white cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                            onClick={() => canApprove && handleVerify('VERIFIED')}
                            disabled={actionLoading || !canApprove}
                          >
                            {actionLoading ? <Loader className="animate-spin" size={15}/> : <Check size={15}/>}
                            Phê duyệt hồ sơ
                          </button>
                          {!canApprove && (
                            <div className="absolute bottom-full right-0 mb-2 w-56 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              {!step1Done && '⚠ Chưa xác nhận lệ phí.'}
                              {step1Done && !step2Done && `⚠ Còn ${totalDocs - verifiedDocs} tài liệu chưa duyệt.`}
                              <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-900"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={`px-4 py-2.5 rounded-lg border flex items-center gap-4 shadow-sm ${selectedProfile.status === 'VERIFIED' ? 'bg-[#ECFDF3] border-[#D1FADF]' : 'bg-[#FEF3F2] border-[#FEE4E2]'}`}>
                      <div className={`text-sm font-bold flex items-center gap-2 ${selectedProfile.status === 'VERIFIED' ? 'text-[#027A48]' : 'text-[#B42318]'}`}>
                        {selectedProfile.status === 'VERIFIED' ? <Check size={16} /> : <X size={16} />}
                        {selectedProfile.status === 'VERIFIED' ? 'Đã phê duyệt toàn bộ' : 'Đã từ chối hồ sơ'}
                      </div>
                      <button 
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md shadow-sm transition-colors"
                        onClick={() => handleVerify('PENDING')}
                        disabled={actionLoading}
                      >
                        Hoàn tác
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              </div>

              {/* --- Section 2: Cards Info & Scores (Side by Side) --- */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Info Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-full">
                  <h4 className="font-bold text-sm text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <User size={16} className="text-slate-400"/> Thông tin cá nhân
                  </h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Ngày sinh</div>
                      <div className="text-sm font-medium text-slate-800">{selectedProfile.dob || '---'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Giới tính</div>
                      <div className="text-sm font-medium text-slate-800">{selectedProfile.gender || '---'}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Địa chỉ</div>
                      <div className="text-sm font-medium text-slate-800 leading-relaxed">{selectedProfile.address || '---'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Khu vực ưu tiên</div>
                      <div className="text-sm font-bold text-slate-700">{selectedProfile.priority_area || 'Không'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Đối tượng ưu tiên</div>
                      <div className="text-sm font-bold text-slate-700">{selectedProfile.priority_object || 'Không'}</div>
                    </div>
                  </div>
                </div>

                {/* Scores Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-full">
                  <h4 className="font-bold text-sm text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <FileCheck size={16} className="text-slate-400"/> Điểm số khai báo
                  </h4>
                  {selectedProfile.scores && Object.keys(selectedProfile.scores).length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedProfile.scores).map(([subject, score]) => (
                        <div key={subject} className="flex justify-between items-center py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg">
                          <span className="text-sm text-slate-600 font-medium">{subject}</span>
                          <span className="text-sm font-bold text-slate-900 tabular-nums">{score.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-6">
                      <AlertTriangle size={24} className="mb-2 opacity-20" />
                      <span className="text-sm font-medium">Chưa có dữ liệu điểm</span>
                    </div>
                  )}
                </div>

              </div>

              {/* --- Section: Nguyện vọng đăng ký --- */}
              {selectedProfile.applications?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Target size={16} className="text-slate-400" />
                      Nguyện vọng đăng ký ({selectedProfile.applications.length})
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="bg-white border-b border-slate-200">
                          <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">NV</th>
                          <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Ngành</th>
                          <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Phương thức</th>
                          <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Tổ hợp</th>
                          <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-center">Tổng điểm</th>
                          <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">Kết quả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedProfile.applications
                          .sort((a, b) => a.priority_order - b.priority_order)
                          .map(app => (
                            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-4">
                                <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                                  {app.priority_order}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="font-bold text-slate-800">{app.major_name}</div>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{app.major_code}</div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded">{app.method_name}</span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="font-mono text-sm text-slate-600">{app.combination_code || '—'}</span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                {app.calculated_score != null ? (
                                  <span className="text-base font-bold text-slate-900 tabular-nums">{app.calculated_score.toFixed(2)}</span>
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-right">
                                {app.admission_result ? (
                                  app.admission_result.is_passed ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-[#ECFDF3] text-[#027A48] border border-[#D1FADF]">
                                      <Check size={10} /> Trúng tuyển
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-400 border border-slate-200">
                                      <X size={10} /> Không đạt
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium">Chờ xét</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- Section 3: Documents Table --- */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[350px]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Layers size={16} className="text-slate-400"/>
                    Danh sách Minh chứng đính kèm ({selectedProfile.documents?.length || 0})
                  </h4>
                </div>
                
                {selectedProfile.documents?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="bg-white border-b border-slate-200">
                          <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Loại tài liệu</th>
                          <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Tệp tin</th>
                          <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Trạng thái</th>
                          <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">Thao tác duyệt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedProfile.documents.map(doc => (
                          <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-5 py-4 font-bold text-slate-800">{doc.type}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 max-w-[200px] xl:max-w-[300px]">
                                <FileText size={16} className="text-blue-500 flex-shrink-0"/>
                                <span className="truncate text-slate-600 text-xs font-medium" title={doc.file_url.split('/').pop()}>
                                  {doc.file_url.split('/').pop()}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              {getStatusBadge(doc.status)}
                            </td>
                            <td className="px-5 py-4 text-right">
                              {docRejectionId === doc.id ? (
                                <div className="inline-flex items-center gap-2 w-64">
                                  <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Lý do..." 
                                    className="flex-1 p-1.5 text-xs border border-red-300 rounded focus:outline-none focus:border-red-500 bg-white"
                                    value={docRejectionReason}
                                    onChange={e => setDocRejectionReason(e.target.value)}
                                  />
                                  <button onClick={confirmRejectDocument} className="px-2 py-1.5 bg-red-600 text-white text-xs font-bold rounded">Xác nhận</button>
                                  <button onClick={() => setDocRejectionId(null)} className="px-2 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded">Hủy</button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2">
                                  <button 
                                    onClick={() => setPreviewDoc(doc)}
                                    className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1.5"
                                  >
                                    <Eye size={14}/> Xem nhanh
                                  </button>
                                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                  <button 
                                    onClick={() => processVerifyDocument(doc.id, 'VERIFIED')}
                                    className="px-3 py-1.5 text-xs font-bold text-[#027A48] hover:bg-[#ECFDF3] rounded-md transition-colors"
                                    disabled={actionLoading}
                                  >
                                    Hợp lệ
                                  </button>
                                  <button 
                                    onClick={() => setDocRejectionId(doc.id)}
                                    className="px-3 py-1.5 text-xs font-bold text-[#B42318] hover:bg-[#FEF3F2] rounded-md transition-colors"
                                    disabled={actionLoading}
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <Layers size={24} className="text-slate-300" />
                    </div>
                    <span className="text-sm font-medium">Thí sinh này chưa tải lên minh chứng nào.</span>
                  </div>
                )}
              </div>

            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm min-h-[500px]">
              <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa chọn hồ sơ</h3>
              <p className="text-sm text-slate-500 text-center leading-relaxed max-w-sm">Vui lòng chọn một hồ sơ bên danh sách để xem thông tin chi tiết và duyệt minh chứng.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- QUICK VIEW MODAL --- */}
      {previewDoc && (
        <div className="fixed inset-0 z-[150] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate__animated animate__fadeIn animate__faster">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden animate__animated animate__zoomIn animate__faster">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-slate-900">{previewDoc.type}</h3>
                {getStatusBadge(previewDoc.status)}
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href={`http://localhost:8000${previewDoc.file_url}`} target="_blank" rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Download size={14}/> Tải xuống
                </a>
                <div className="w-px h-5 bg-slate-200 mx-2"></div>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20}/>
                </button>
              </div>
            </div>

            {/* Modal Viewer */}
            <div className="flex-1 bg-slate-100/50 flex items-center justify-center overflow-auto p-6 relative">
              {previewDoc.file_url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i) ? (
                <div className="flex flex-col items-center justify-center p-10 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-md w-full text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <FileText size={40} className="text-blue-500" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-2">Tệp không hỗ trợ xem trước</h4>
                  <p className="text-sm text-slate-500 mb-6 truncate w-full px-4">{previewDoc.file_url.split('/').pop()}</p>
                  <a href={`http://localhost:8000${previewDoc.file_url}`} target="_blank" rel="noreferrer" className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors shadow-sm flex items-center gap-2">
                    <Eye size={16}/> Mở tab mới để xem
                  </a>
                </div>
              ) : (
                <img 
                  src={`http://localhost:8000${previewDoc.file_url}`} 
                  alt={previewDoc.type}
                  className="max-w-full h-auto object-contain rounded-xl shadow-md border border-slate-200 bg-white"
                  style={{ maxHeight: 'calc(90vh - 150px)' }}
                />
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-sm text-slate-500 font-medium">Bạn có thể duyệt hoặc từ chối trực tiếp tại đây.</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => processVerifyDocument(previewDoc.id, 'REJECTED')}
                  className="px-6 py-2 bg-white text-[#B42318] border border-red-200 hover:bg-[#FEF3F2] text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                  disabled={actionLoading}
                >
                  <X size={16}/> Đánh dấu Từ chối
                </button>
                <button 
                  onClick={() => processVerifyDocument(previewDoc.id, 'VERIFIED')}
                  className="px-6 py-2 bg-[#027A48] hover:bg-green-800 text-white text-sm font-bold rounded-lg transition-colors shadow-md flex items-center gap-2"
                  disabled={actionLoading}
                >
                  <Check size={16}/> Đánh dấu Hợp lệ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
      `}} />
    </div>
  );
}
