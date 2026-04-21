import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export default function PublicLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-body">
      <PublicHeader />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
