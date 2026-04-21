import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Folders, CheckSquare, Target, Settings, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();
  const path = location.pathname;

  const links = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Thống kê' },
    { to: '/admin/catalogs', icon: Folders, label: 'Quản lý D.mục' },
    { to: '/admin/verifications', icon: CheckSquare, label: 'Duyệt hồ sơ' },
    { to: '/admin/formulas', icon: Settings, label: 'Công thức xét' },
    { to: '/admin/admissions', icon: Target, label: 'Xét tuyển' },
  ];

  return (
    <div className="sidebar d-flex flex-column p-3" style={{ width: '250px' }}>
      <div className="fs-5 fw-bold mb-4 px-2">
        Admin<span className="text-muted fw-normal">Portal</span>
      </div>
      
      <div className="flex-grow-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = path.includes(link.to);
          return (
            <Link 
              key={link.to} 
              to={link.to} 
              className={`sidebar-link text-decoration-none ${isActive ? 'active fw-medium' : ''}`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="border-top pt-3 mt-3">
        <div className="px-2 mb-2 small text-muted">
          <Users size={16} className="me-2"/> Quản trị viên
        </div>
        <Link to="/" className="sidebar-link text-decoration-none text-danger mt-auto">
          <LogOut size={18} />
          Đăng xuất
        </Link>
      </div>
    </div>
  );
}
