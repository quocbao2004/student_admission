import { useState, useEffect } from 'react';
import { Users, FileCheck, Clock, DollarSign, ArrowUpRight, Activity, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { API_BASE } from '../../config';

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const authFetch = async (url) => {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 401) {
      logout();
      return;
    }
    return res.json();
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authFetch(`${API_BASE}/admissions/admin/dashboard-stats/`);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-5 text-center">Đang tải dữ liệu...</div>;

  const kpis = [
    { label: 'Tổng thí sinh', value: stats?.total_candidates || 0, icon: Users, color: 'primary', trend: '+12%' },
    { label: 'Đã duyệt', value: stats?.verified_count || 0, icon: FileCheck, color: 'success', trend: '+5%' },
    { label: 'Chờ duyệt', value: stats?.pending_count || 0, icon: Clock, color: 'warning', trend: '-2%' },
    { label: 'Lệ phí đã thu', value: `${(stats?.total_revenue || 0).toLocaleString()}đ`, icon: DollarSign, color: 'info', trend: '+18%' },
  ];

  return (
    <div className="admin-dashboard animate__animated animate__fadeIn">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 border-0">Tổng quan Hệ thống</h2>
          <p className="text-muted small mb-0">Báo cáo tình hình tuyển sinh theo thời gian thực</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-white border shadow-sm btn-sm d-flex align-items-center gap-2">
            <Calendar size={16} /> 7 ngày qua
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-5">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="col-md-3">
            <div className="card border-0 shadow-sm h-100 card-kpi">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className={`p-3 rounded-3 bg-${kpi.color} bg-opacity-10`}>
                    <kpi.icon className={`text-${kpi.color}`} size={24} />
                  </div>
                  <span className={`badge rounded-pill bg-${kpi.trend.startsWith('+') ? 'success' : 'danger'} bg-opacity-10 text-${kpi.trend.startsWith('+') ? 'success' : 'danger'} small`}>
                    {kpi.trend}
                  </span>
                </div>
                <h3 className="fw-bold mb-1">{kpi.value}</h3>
                <p className="text-muted small mb-0">{kpi.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Recent Activity Table */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Hoạt động nộp hồ sơ gần đây</h6>
              <button className="btn btn-link btn-sm text-decoration-none">Xem tất cả</button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light border-0">
                  <tr>
                    <th className="px-4 py-3 small text-muted text-uppercase">Thí sinh</th>
                    <th className="py-3 small text-muted text-uppercase">Ngành đăng ký</th>
                    <th className="py-3 small text-muted text-uppercase">Thời gian</th>
                    <th className="px-4 py-3 text-end small text-muted text-uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_activities?.map((act) => (
                    <tr key={act.id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-small">{act.candidate[0]}</div>
                          <span className="fw-medium">{act.candidate}</span>
                        </div>
                      </td>
                      <td className="py-3 fw-medium">{act.major}</td>
                      <td className="py-3 text-muted small">{new Date(act.time).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3 text-end">
                        <button className="btn btn-light btn-sm rounded-circle"><ArrowUpRight size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions / Mini Stats */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-navy text-white mb-4">
            {/* <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Activity size={20} className="text-warning" />
                <h6 className="mb-0 fw-bold">Trạng thái Hệ thống</h6>
              </div>
              <p className="small opacity-75">Tất cả các dịch vụ đang hoạt động ổn định. Đã xử lý 4.5k requests/phút.</p>
              <div className="mt-4">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Tiến độ kiểm duyệt</span>
                  <span>{Math.round(((stats?.verified_count || 0) / (stats?.total_candidates || 1)) * 100)}%</span>
                </div>
                <div className="progress overflow-hidden" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="progress-bar bg-warning" style={{ width: `${((stats?.verified_count || 0) / (stats?.total_candidates || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div> */}
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4">Lối tắt tác vụ</h6>
              <div className="d-grid gap-2">
                <button className="btn btn-light border py-2 text-start d-flex align-items-center gap-3">
                  <div className="p-2 bg-primary bg-opacity-10 text-primary rounded"><FileCheck size={16} /></div>
                  <span className="small fw-semibold">Duyệt hồ sơ nhanh</span>
                </button>
                <button className="btn btn-light border py-2 text-start d-flex align-items-center gap-3">
                  <div className="p-2 bg-success bg-opacity-10 text-success rounded"><Calendar size={16} /></div>
                  <span className="small fw-semibold">Lịch nộp hồ sơ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-navy { background-color: #0c1a32; }
        .card-kpi { transition: transform 0.2s ease; border: 1px solid rgba(0,0,0,0.02) !important; }
        .card-kpi:hover { transform: translateY(-5px); }
        .avatar-small { width: 32px; height: 32px; background: #eee; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #666; font-size: 12px; }
        .btn-white { background: white; }
      `}</style>
    </div>
  );
}
