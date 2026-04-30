import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CandidateHeader from '../components/CandidateHeader';
import Footer from '../components/Footer';
import { AdmissionFlowProvider, useAdmissionFlow } from '../contexts/AdmissionFlowContext';

function FlowGuard() {
  const { getRedirectPath, isLoadingFlow } = useAdmissionFlow();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoadingFlow) return;
    const redirectTo = getRedirectPath(location.pathname);
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [location.pathname, getRedirectPath, navigate, isLoadingFlow]);

  return null;
}

export default function CandidateLayout() {
  return (
    <AdmissionFlowProvider>
      <CandidateLayoutInner />
    </AdmissionFlowProvider>
  );
}

function CandidateLayoutInner() {
  const { isLoadingFlow } = useAdmissionFlow();

  if (isLoadingFlow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <FlowGuard />
      <CandidateHeader />
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
