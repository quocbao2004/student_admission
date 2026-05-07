import { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, BookOpen, GraduationCap, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { API_BASE } from '../../config';

// Helper to generate stable mock variance for demo purposes
const getVariance = (code) => {
  const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const diff = ((hash % 15) - 7) / 10; // -0.7 to +0.7
  return diff;
};

export default function Lookup() {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data from API
  const [majorsStats, setMajorsStats] = useState([]);
  const [methods, setMethods] = useState([]);
  
  // States
  const [personalScore, setPersonalScore] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [filters, setFilters] = useState({
    year: '2025',
    methodId: '',
    searchTerm: '',
    scoreRange: 'ALL'
  });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const catRes = await authFetch(`${API_BASE}/admissions/catalogs/`);
        const catData = await catRes.json();
        setMethods(catData.methods);
        if (catData.methods.length > 0) {
          setFilters(f => ({ ...f, methodId: catData.methods[0].id }));
        }

        const statsRes = await authFetch(`${API_BASE}/admissions/stats/majors/`);
        const statsData = await statsRes.json();
        setMajorsStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Filter Logic
  const filteredResults = useMemo(() => {
    if (!majorsStats.length) return [];

    let results = majorsStats.map(major => {
      const benchmark = major.benchmarks.find(b => 
        b.year.toString() === filters.year && 
        b.method === filters.methodId
      );

      return {
        id: major.id,
        code: major.code,
        name: major.name,
        score: benchmark ? benchmark.score : '-',
        variance: getVariance(major.code),
        // Mock combinations based on code
        combinations: major.code.startsWith('IT') ? 'A00, A01, D01' : 
                      major.code.startsWith('BA') ? 'A00, A01, D01, C00' :
                      major.code.startsWith('EN') ? 'D01, D14, D15' : 'A00, A01, B00'
      };
    });

    // Apply Search
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      results = results.filter(m => m.name.toLowerCase().includes(term) || m.code.toLowerCase().includes(term));
    }

    // Apply Score Range Filter
    if (filters.scoreRange !== 'ALL') {
      results = results.filter(m => {
        if (m.score === '-') return false;
        const s = parseFloat(m.score);
        if (filters.scoreRange === 'LT20') return s < 20;
        if (filters.scoreRange === '20-25') return s >= 20 && s <= 25;
        if (filters.scoreRange === 'GT25') return s > 25;
        return true;
      });
    }

    // Add Category
    results = results.map(m => {
      const lowerName = m.name.toLowerCase();
      let category = 'Đại trà';
      if (lowerName.includes('chất lượng cao') || lowerName.includes('tài năng')) {
        category = 'Chất lượng cao';
      } else if (lowerName.includes('quốc tế')) {
        category = 'Quốc tế';
      }
      return { ...m, category };
    });

    return results;
  }, [filters, majorsStats]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const years = ['2026', '2025', '2024', '2023', '2022'];

  const renderVariance = (val) => {
    if (val === 0) return <div className="flex items-center justify-end text-slate-400 gap-1 text-[10px]"><Minus size={12}/> 0.0</div>;
    if (val > 0) return <div className="flex items-center justify-end text-slate-500 gap-1 text-[10px]"><TrendingUp size={12}/> +{val.toFixed(1)}</div>;
    return <div className="flex items-center justify-end text-slate-500 gap-1 text-[10px]"><TrendingDown size={12}/> {val.toFixed(1)}</div>;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-sans">
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Tra cứu Điểm chuẩn</h2>
        <p className="text-slate-500 text-sm mt-1">Dữ liệu tham khảo từ các kỳ tuyển sinh trước.</p>
      </div>


      {/* Smart Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex-1 min-w-[200px] flex items-center bg-white border border-slate-200 rounded-md px-3 py-2 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-all">
          <Search size={16} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm ngành học..." 
            className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-900 placeholder:text-slate-400"
            value={filters.searchTerm}
            onChange={e => setFilters({ ...filters, searchTerm: e.target.value })}
          />
        </div>
        
        <div className="flex items-center bg-white border border-slate-200 rounded-md px-3 py-2">
          <Calendar size={14} className="text-slate-400 mr-2" />
          <select 
            className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-700 cursor-pointer"
            value={filters.year}
            onChange={e => setFilters({ ...filters, year: e.target.value })}
          >
            {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
          </select>
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-md px-3 py-2">
          <BookOpen size={14} className="text-slate-400 mr-2" />
          <select 
            className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-700 cursor-pointer max-w-[200px]"
            value={filters.methodId}
            onChange={e => setFilters({ ...filters, methodId: e.target.value })}
          >
            {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-md px-3 py-2">
          <GraduationCap size={14} className="text-slate-400 mr-2" />
          <select 
            className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-700 cursor-pointer"
            value={filters.scoreRange}
            onChange={e => setFilters({ ...filters, scoreRange: e.target.value })}
          >
            <option value="ALL">Mọi mức điểm</option>
            <option value="LT20">Dưới 20</option>
            <option value="20-25">20 - 25</option>
            <option value="GT25">Trên 25</option>
          </select>
        </div>
      </div>

      {/* Results View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-4"></div>
          <div className="text-slate-500 font-medium">Đang tải dữ liệu...</div>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-16 border border-slate-200 rounded-lg bg-white">
          <p className="text-sm text-slate-500">Không tìm thấy kết quả phù hợp.</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          {/* Table Header */}
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Danh sách Ngành học</h3>
            <span className="text-xs text-slate-500">Tổng cộng {filteredResults.length} kết quả</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="px-5 py-3 font-medium text-slate-500">Ngành học</th>
                  <th className="px-5 py-3 font-medium text-slate-500">Hệ đào tạo</th>
                  <th className="px-5 py-3 font-medium text-slate-500 text-right">Điểm chuẩn</th>
                  <th className="px-5 py-3 font-medium text-slate-500 w-48">Phổ điểm</th>
                  <th className="px-5 py-3 font-medium text-slate-500 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedResults.map(major => {
                  const scoreNum = parseFloat(major.score);
                  const isUpdating = isNaN(scoreNum);
                  
                  let rowOpacity = "opacity-100";
                  let statusBadge = null;

                  if (personalScore && !isUpdating) {
                    const pScore = parseFloat(personalScore);
                    if (pScore >= scoreNum) {
                      statusBadge = <span className="ml-2 px-1.5 py-0.5 bg-slate-800 text-white text-[10px] font-medium rounded">Đủ đ/k</span>;
                    } else if (pScore >= scoreNum - 1) {
                      statusBadge = <span className="ml-2 px-1.5 py-0.5 border border-slate-300 text-slate-600 text-[10px] font-medium rounded">Cận điểm</span>;
                    } else {
                      rowOpacity = "opacity-40 hover:opacity-100 transition-opacity";
                    }
                  }

                  return (
                    <tr key={major.id} className={`hover:bg-slate-50 transition-colors ${rowOpacity}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center mb-0.5">
                          <span className="font-medium text-slate-900">{major.name}</span>
                          {statusBadge}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{major.code}</span>
                          <span>•</span>
                          <span>Tổ hợp: {major.combinations}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                          {major.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isUpdating ? (
                          <span className="text-xs text-slate-400">Đang cập nhật</span>
                        ) : (
                          <div>
                            <span className="font-semibold text-slate-900">{scoreNum.toFixed(2)}</span>
                            <span className="text-xs text-slate-400 ml-1">/30</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {!isUpdating && (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-slate-400 rounded-full" 
                                style={{ width: `${(scoreNum/30)*100}%` }}
                              ></div>
                            </div>
                            <div className="w-12 text-right">
                              {renderVariance(major.variance)}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline">
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-white">
              <div className="text-xs text-slate-500">
                Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredResults.length)} trong {filteredResults.length} kết quả
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded ${
                      currentPage === p 
                        ? 'bg-slate-900 text-white' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
