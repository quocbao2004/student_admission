import { Link } from 'react-router-dom';
import {
  Clock, CheckCircle, ChevronRight, FileText, Award,
  CheckCircle2, Lock, AlertCircle, Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmissionFlow, FLOW_STEPS } from '../../contexts/AdmissionFlowContext';

const STEP_DESCRIPTIONS = [
  'Cập nhật thông tin cá nhân và tải lên minh chứng.',
  'Đăng ký các ngành học bạn mong muốn xét tuyển.',
  'Thanh toán lệ phí xét tuyển để hoàn tất hồ sơ.',
  'Theo dõi trạng thái và nhận kết quả trúng tuyển.',
];

export default function Dashboard() {
  const { user } = useAuth();
  const { completion, unlockedIndex } = useAdmissionFlow();
  const displayName = user ? (user.full_name || user.email) : 'bạn';

  const currentStepIndex = unlockedIndex;

  const isStepDone = (index) => {
    if (index === 0) return completion.hasProfile;
    if (index === 1) return completion.hasAspirations;
    if (index === 2) return completion.hasPaid;
    return false;
  };

  const nextStep = FLOW_STEPS[currentStepIndex];
  const allDone = completion.hasProfile && completion.hasAspirations && completion.hasPaid;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-sans text-slate-900">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          <Info size={14} />
          Cổng tuyển sinh 2026
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">Chào mừng, {displayName}!</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-2xl">
          Hệ thống xét tuyển đại học trực tuyến. Vui lòng hoàn tất các bước bên dưới để tham gia xét tuyển đợt 1.
        </p>
      </div>

      {/* Stepper Card */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Tiến độ hồ sơ</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Bước {currentStepIndex + 1}/4</span>
        </div>
        <div className="p-8">
          <div className="relative flex justify-between mb-12 px-10">
            {/* Background Line */}
            <div className="absolute top-4 left-10 right-10 h-[1px] bg-slate-100 -z-0"></div>
            {/* Active Progress Line */}
            <div 
              className="absolute top-4 left-10 h-[1px] bg-slate-900 transition-all duration-500 -z-0" 
              style={{ width: `calc(${(currentStepIndex / 3) * 100}% - 80px)` }}
            ></div>

            {FLOW_STEPS.map((step, index) => {
              const done = isStepDone(index);
              const active = index === currentStepIndex;
              const locked = index > unlockedIndex;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10 w-32">
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${done ? 'bg-slate-900 text-white shadow-md' : 
                      active ? 'bg-white border-2 border-slate-900 text-slate-900 ring-4 ring-slate-50 shadow-sm' : 
                      'bg-white border border-slate-200 text-slate-300'}
                  `}>
                    {done ? <CheckCircle2 size={16} /> : locked ? <Lock size={12} /> : index + 1}
                  </div>
                  <span className={`mt-3 text-[11px] font-bold uppercase tracking-wide text-center px-1 ${active ? 'text-slate-900' : done ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action Call */}
          <div className={`p-5 rounded-lg border flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${allDone ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${allDone ? 'bg-white/10' : 'bg-white border border-slate-200 text-slate-400 shadow-sm'}`}>
                {allDone ? <CheckCircle size={20} className="text-white" /> : <AlertCircle size={20} />}
              </div>
              <div>
                <div className={`text-sm font-bold ${allDone ? 'text-white' : 'text-slate-900'}`}>
                  {allDone ? "Hồ sơ của bạn đã sẵn sàng" : 
                   (currentStepIndex === 2 && !completion.isVerified) ? "Hồ sơ đang chờ xác minh" : 
                   `Bước tiếp theo: ${nextStep?.label}`}
                </div>
                <div className={`text-xs mt-1 ${allDone ? 'text-white/60' : 'text-slate-500'}`}>
                  {allDone ? "Hãy quay lại tra cứu kết quả khi Nhà trường công bố." : 
                   (currentStepIndex === 2 && !completion.isVerified) ? "Bạn đã đăng ký nguyện vọng. Vui lòng đợi 1-3 ngày làm việc để cán bộ tuyển sinh duyệt minh chứng trước khi thanh toán." : 
                   STEP_DESCRIPTIONS[currentStepIndex]}
                </div>
              </div>
            </div>
            {!allDone && !(currentStepIndex === 2 && !completion.isVerified) && (
              <Link to={nextStep?.path} className="px-6 py-2.5 bg-slate-900 text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm shrink-0">
                Bắt đầu ngay <ChevronRight size={14} className="inline ml-1" />
              </Link>
            )}
            {allDone && (
              <Link to="/candidate/aspirations" className="px-6 py-2.5 bg-white text-slate-900 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm shrink-0">
                Xem kết quả <ChevronRight size={14} className="inline ml-1" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* News Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} /> Tin tức thông báo
            </h3>
            <button className="text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase">Tất cả</button>
          </div>
          
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="group p-5 bg-white border border-slate-200 rounded-lg hover:border-slate-900 transition-all cursor-pointer">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Thông báo · 15/04/2026</div>
                <h4 className="text-base font-semibold text-slate-900 group-hover:underline mb-2">
                  {i === 1 ? 'Hướng dẫn tải lên minh chứng Học bạ hợp lệ' : 'Gia hạn thời gian nộp lệ phí đợt 1'}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  Trường Đại học XYZ lưu ý thí sinh khi chụp ảnh học bạ cần chụp đủ các trang ghi điểm cuối kỳ của 3 năm lớp 10, 11 và 12 để đảm bảo quyền lợi...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Award size={16} /> Hỗ trợ
          </h3>
          <div className="bg-slate-900 text-white rounded-lg p-6 space-y-4 shadow-lg shadow-slate-200">
            <p className="text-xs text-slate-400 leading-relaxed">
              Mọi thắc mắc về hồ sơ, thủ tục nhập điểm hoặc nộp lệ phí, vui lòng liên hệ hotline:
            </p>
            <div className="text-2xl font-bold tracking-tighter py-2 border-y border-white/10">1900 1234</div>
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <Clock size={14} /> 08:00 – 17:00 (Thứ 2 – 6)
            </div>
            <button className="w-full py-2.5 bg-white text-slate-900 rounded-md text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
              Nhắn tin hỗ trợ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
