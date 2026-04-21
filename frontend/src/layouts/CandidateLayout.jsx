import { Outlet } from 'react-router-dom';
import CandidateHeader from '../components/CandidateHeader';
import Footer from '../components/Footer';

export default function CandidateLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-body">
      <CandidateHeader />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

