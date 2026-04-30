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
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Admin<span className="text-slate-500 font-normal">Portal</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = path.includes(link.to);
          return (
            <Link 
              key={link.to} 
              to={link.to} 
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-slate-800 text-white font-medium' 
                  : 'hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 px-3 mb-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <Users size={14} /> Quản trị viên
        </div>
        <Link to="/" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 transition-colors">
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </Link>
      </div>
    </div>
  );
}
