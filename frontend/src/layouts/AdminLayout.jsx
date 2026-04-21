import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-vh-100 d-flex">
      <AdminSidebar />
      <main className="flex-grow-1 p-4 bg-body overflow-auto" style={{ height: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
