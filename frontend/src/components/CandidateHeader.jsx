import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Mail, User, LogOut, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmissionFlow, FLOW_STEPS } from '../contexts/AdmissionFlowContext';

export default function CandidateHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unlockedIndex, completion } = useAdmissionFlow();
  const displayName = user ? (user.full_name || user.email) : 'Khách';

  const isStepDone = (stepIndex) => {
    if (stepIndex === 0) return completion.isVerified;
    if (stepIndex === 1) return completion.hasAspirations;
    if (stepIndex === 2) return completion.hasPaid;
    return false;
  };

  const handleStepClick = (stepIndex, path) => {
    if (stepIndex <= unlockedIndex) {
      navigate(path);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top utility bar */}
      <div className="bg-slate-900 text-slate-400 py-2 text-[10px] font-bold uppercase tracking-widest">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <Phone size={12} />
              Hotline: <strong className="text-white">1900 1234</strong>
            </span>
            <span className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <Mail size={12} />
              tuyensinh@university.edu.vn
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-300">
              <User size={12} />
              <span>{displayName}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <LogOut size={12} /> Thoát
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Steps */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-6">
          <Link to="/candidate/dashboard" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center font-black text-sm rounded transition-transform group-hover:scale-105">
              U
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">University Admission</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cổng thí sinh &bull; 2026</p>
            </div>
          </Link>

          <nav className="flex items-center bg-slate-50 border border-slate-200 rounded-md p-1">
            {FLOW_STEPS.map((step, index) => {
              const isActive = location.pathname.startsWith(step.path);
              const isUnlocked = index <= unlockedIndex;
              const isDone = isStepDone(index);

              return (
                <button
                  key={step.key}
                  onClick={() => handleStepClick(index, step.path)}
                  disabled={!isUnlocked}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all
                    ${isActive ? 'bg-white text-slate-900 shadow-sm' : 
                      isUnlocked ? 'text-slate-400 hover:text-slate-600' : 'text-slate-300 cursor-not-allowed'}
                  `}
                >
                  <span className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-[10px]
                    ${isDone ? 'bg-slate-900 text-white' : 
                      isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}
                  `}>
                    {isDone ? <CheckCircle2 size={12} /> : !isUnlocked ? <Lock size={10} /> : index + 1}
                  </span>
                  <span className="hidden lg:inline">{step.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
