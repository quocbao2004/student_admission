import { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, BarChart3, Info, ChevronRight, Activity, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { API_BASE } from '../../config';


export default function Statistics() {
  const { token, logout } = useAuth();
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [years] = useState([2023, 2024, 2025]);

  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.status === 401) {
      logout();
      throw new Error('Hết hạn phiên đăng nhập');
    }
    return res;
  };

  const fetchStats = async (query = '') => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/admissions/stats/majors/?search=${query}`);
      const data = await res.json();
      setMajors(data);
      // Không tự động chọn ngành đầu tiên để bảng trông thoáng hơn
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getScoreByYear = (benchmarks, year) => {
    const b = benchmarks.find(item => item.year === year);
    return b ? b.score.toFixed(2) : '-';
  };

  const getCompetitionInfo = (rate) => {
    if (rate >= 2) return { color: 'bg-danger', label: 'Rất cao', text: 'text-danger' };
    if (rate >= 1) return { color: 'bg-warning', label: 'Vừa', text: 'text-warning' };
    return { color: 'bg-success', label: 'Thấp', text: 'text-success' };
  };

  return (
    <div className="container-fluid py-4 px-lg-5 bg-white min-vh-100">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1 text-dark">Bảng Điểm chuẩn & Thống kê</h1>
          <p className="text-muted mb-0 small">So sánh biến động điểm chuẩn qua các năm và cập nhật tình hình hồ sơ 2026.</p>
        </div>
        <div className="d-flex gap-2">
          <form onSubmit={(e) => { e.preventDefault(); fetchStats(searchTerm); }} className="position-relative">
            <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input 
              type="text" 
              className="form-control ps-5 border-secondary-subtle" 
              placeholder="Tìm tên ngành hoặc mã ngành..."
              style={{ minWidth: '300px', borderRadius: '8px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* Main Content: Comparison Table */}
      <div className="card shadow-sm border-0 mb-5 overflow-hidden" style={{ borderRadius: '12px', border: '1px solid #edf2f7' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="bg-light text-muted small text-uppercase ls-1">
                <th className="ps-4 py-3 fw-bold" style={{ minWidth: '250px' }}>Ngành đào tạo</th>
                <th className="py-3 fw-bold">Mã ngành</th>
                <th className="py-3 fw-bold text-center">Chỉ tiêu '26</th>
                {years.map(year => (
                  <th key={year} className="py-3 fw-bold text-center">Điểm {year}</th>
                ))}
                <th className="pe-4 py-3 fw-bold text-end">Tình trạng '26</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={years.length + 4} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : majors.length === 0 ? (
                <tr>
                  <td colSpan={years.length + 4} className="text-center py-5 text-muted">Không tìm thấy kết quả nào.</td>
                </tr>
              ) : (
                majors.map(m => {
                  const comp = getCompetitionInfo(m.match_rate);
                  const isSelected = selectedMajor?.id === m.id;
                  return (
                    <tr 
                      key={m.id} 
                      className={`cursor-pointer ${isSelected ? 'table-primary-light' : ''}`}
                      onClick={() => setSelectedMajor(isSelected ? null : m)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <td className="ps-4 py-3">
                        <div className="fw-bold text-dark">{m.name}</div>
                        <div className="extra-small text-muted d-md-none">Mã: {m.code}</div>
                      </td>
                      <td className="py-3"><span className="badge bg-light text-dark border fw-normal">{m.code}</span></td>
                      <td className="py-3 text-center fw-semibold text-secondary">{m.quota}</td>
                      {years.map(year => {
                        const score = getScoreByYear(m.benchmarks, year);
                        return (
                          <td key={year} className="py-3 text-center">
                            <span className={score !== '-' ? 'fw-bold text-dark' : 'text-muted'}>{score}</span>
                          </td>
                        );
                      })}
                      <td className="pe-4 py-3 text-end">
                        <div className="d-inline-flex align-items-center gap-2">
                          <span className={`d-inline-block rounded-circle ${comp.color}`} style={{ width: '8px', height: '8px' }}></span>
                          <span className={`${comp.text} small fw-bold`}>{comp.label}</span>
                          <ChevronRight size={14} className={`ms-2 ${isSelected ? 'rotate-90' : 'text-muted opacity-50'}`} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Detail Section (Appears only when a row is clicked) */}
      {selectedMajor && (
        <div className="fade-in">
          <div className="row g-4 mb-5">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0 bg-white p-4" style={{ borderRadius: '12px' }}>
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h4 className="fw-bold text-primary mb-1">{selectedMajor.name}</h4>
                    <p className="text-muted small mb-0">Phân tích tình hình hồ sơ năm 2026 hiện tại</p>
                  </div>
                  <div className="text-end">
                    <div className="small text-muted">Tỷ lệ hồ sơ / Chỉ tiêu</div>
                    <div className="h4 fw-bold mb-0">{(selectedMajor.match_rate * 100).toFixed(0)}%</div>
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-4 text-center border-end">
                    <div className="small text-muted mb-1">Chỉ tiêu</div>
                    <div className="h4 fw-bold">{selectedMajor.quota}</div>
                  </div>
                  <div className="col-md-4 text-center border-end">
                    <div className="small text-muted mb-1">Đã nộp</div>
                    <div className="h4 fw-bold text-primary">{selectedMajor.application_count}</div>
                  </div>
                  <div className="col-md-4 text-center">
                    <div className="small text-muted mb-1">Tỷ lệ chọi</div>
                    <div className="h4 fw-bold">1:{selectedMajor.match_rate}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="progress overflow-visible mb-2" style={{ height: '8px', borderRadius: '10px', backgroundColor: '#edf2f7' }}>
                    <div 
                      className={`progress-bar rounded-pill ${getCompetitionInfo(selectedMajor.match_rate).color}`}
                      style={{ width: `${Math.min((selectedMajor.application_count/selectedMajor.quota)*100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between extra-small text-muted">
                    <span>0 hồ sơ</span>
                    <span>Chỉ tiêu: {selectedMajor.quota}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 bg-dark text-white p-4 h-100" style={{ borderRadius: '12px' }}>
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Info size={18} /> Ghi chú ngành học
                </h6>
                <p className="small opacity-75" style={{ lineHeight: '1.6' }}>
                  {selectedMajor.description || 'Hệ thống đang cập nhật thông tin giới thiệu cho ngành này. Vui lòng quay lại sau.'}
                </p>
                <div className="mt-auto pt-3">
                  <button 
                    className="btn btn-outline-light btn-sm w-100 py-2"
                    onClick={() => window.location.href='/candidate/aspirations'}
                  >
                    Đăng ký ngành này
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ls-1 { letter-spacing: 1px; }
        .extra-small { font-size: 0.7rem; }
        .table-primary-light { background-color: #f0f7ff !important; border-left: 4px solid #0d6efd !important; }
        .rotate-90 { transform: rotate(90deg); transition: transform 0.2s; }
        .cursor-pointer:hover { background-color: #f8fafc; }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .border-secondary-subtle { border-color: #e2e8f0 !important; }
      `}</style>
    </div>
  );
}
