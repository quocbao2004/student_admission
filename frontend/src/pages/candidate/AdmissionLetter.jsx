import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';
import { Printer, Loader, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdmissionLetter() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const res = await fetch(`${API_BASE}/admissions/admission-letter/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Lỗi khi tải giấy báo nhập học');
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLetter();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-6 text-center">
        <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Chưa có Giấy báo nhập học</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link to="/candidate/dashboard" className="text-sm font-bold text-slate-900 flex items-center justify-center gap-2 hover:underline">
          <ArrowLeft size={16} /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-serif">
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link to="/candidate/aspirations" className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> Quay lại
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors"
        >
          <Printer size={16} /> In Giấy Báo
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-10 md:p-16 shadow-sm rounded-sm print:border-none print:shadow-none print:p-0">
        <div className="flex justify-between items-start mb-10 border-b-2 border-slate-900 pb-6">
          <div className="text-center">
            <h1 className="text-base font-bold uppercase tracking-wider">Bộ Giáo dục và Đào tạo</h1>
            <h2 className="text-lg font-black uppercase mt-1">Trường Đại học Công Nghệ Tiên Tiến</h2>
          </div>
          <div className="text-center">
            <h1 className="text-base font-bold uppercase tracking-wider">Cộng hòa Xã hội Chủ nghĩa Việt Nam</h1>
            <h2 className="text-sm font-bold mt-1">Độc lập - Tự do - Hạnh phúc</h2>
            <div className="w-32 h-px bg-slate-900 mx-auto mt-2"></div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Giấy Báo Trúng Tuyển</h1>
          <p className="text-lg italic text-slate-600">Và gọi nhập học Đại học Hệ Chính quy Năm {data.year}</p>
        </div>

        <div className="space-y-4 text-base leading-relaxed mb-8">
          <p><strong>HIỆU TRƯỞNG TRƯỜNG ĐẠI HỌC CÔNG NGHỆ TIÊN TIẾN CHÚC MỪNG:</strong></p>
          <p className="flex gap-2"><span>Anh/Chị:</span> <strong className="text-lg uppercase">{data.candidate_name}</strong></p>
          <div className="grid grid-cols-2 gap-4">
            <p className="flex gap-2"><span>Ngày sinh:</span> <strong>{data.dob ? new Date(data.dob).toLocaleDateString('vi-VN') : '---'}</strong></p>
            <p className="flex gap-2"><span>Giới tính:</span> <strong>{data.gender === 'MALE' ? 'Nam' : data.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</strong></p>
          </div>
          <p className="flex gap-2"><span>Số CCCD/CMND:</span> <strong>{data.cccd}</strong></p>
          <p className="flex gap-2"><span>Hộ khẩu thường trú:</span> <strong>{data.address || '---'}</strong></p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-6 rounded-sm mb-10 print:bg-transparent print:border-slate-900">
          <p className="mb-2">Anh/chị đã đủ điều kiện trúng tuyển vào chuyên ngành:</p>
          <p className="text-xl font-bold uppercase mb-4 text-slate-900">{data.major_name} ({data.major_code})</p>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <p className="flex gap-2"><span>Phương thức:</span> <strong>{data.method_name}</strong></p>
            <p className="flex gap-2"><span>Điểm xét tuyển:</span> <strong>{data.total_score}</strong></p>
          </div>
        </div>

        <div className="space-y-3 text-sm leading-relaxed mb-12">
          <p>Nhà trường mời anh/chị đến làm thủ tục nhập học theo thời gian và địa điểm như sau:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Thời gian:</strong> Từ 08:00 đến 17:00, ngày 15/09/{data.year} đến 20/09/{data.year}.</li>
            <li><strong>Địa điểm:</strong> Hội trường lớn, Trường Đại học Công Nghệ Tiên Tiến.</li>
            <li><strong>Hồ sơ mang theo:</strong> Bản chính Giấy chứng nhận kết quả thi, Bản sao công chứng Bằng tốt nghiệp THPT (hoặc giấy chứng nhận tạm thời), Bản sao CCCD, 04 ảnh 3x4, và giấy tờ chứng minh đối tượng ưu tiên (nếu có).</li>
          </ul>
        </div>

        <div className="flex justify-end text-center mt-12">
          <div>
            <p className="italic mb-2">Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
            <p className="font-bold uppercase mb-24">TL. HIỆU TRƯỞNG<br/>TRƯỞNG PHÒNG ĐÀO TẠO</p>
            <p className="font-bold">(Đã ký)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
