import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Folders, CheckSquare, Target, Settings, LogOut, Calculator, CalendarRange } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV_GROUPS = [
  {
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    ],
  },
  {
    label: 'Cấu hình',
    items: [
      { to: '/admin/catalogs', icon: Folders, label: 'Danh mục' },
      { to: '/admin/seasons', icon: CalendarRange, label: 'Đợt xét tuyển' },
      { to: '/admin/formulas', icon: Calculator, label: 'Công thức tính điểm' },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { to: '/admin/verifications', icon: CheckSquare, label: 'Duyệt hồ sơ' },
      { to: '/admin/admissions', icon: Target, label: 'Xét tuyển & Lọc ảo' },
    ],
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const path = location.pathname;
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300 flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white tracking-tight">
          Admin<span className="text-slate-500 font-normal">Portal</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Hệ thống quản lý tuyển sinh</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx}>
            {group.label && (
              <div className="px-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  {group.label}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((link) => {
                const Icon = link.icon;
                const isActive = path === link.to || path.startsWith(link.to + '/');
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? 'text-white' : 'text-slate-500'}
                    />
                    <span>{link.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <div className="flex items-center gap-2 px-3 py-2 text-slate-500">
          <Users size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Quản trị viên</span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
