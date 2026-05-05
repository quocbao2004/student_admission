// Cấu hình môi trường cho Frontend
// export const API_BASE = 'http://localhost:8000/api';
export const API_BASE = 'https://student-admission-m0ct.onrender.com/api';
export const BACKEND_URL = 'https://student-admission-m0ct.onrender.com';


// Các hằng số định danh hệ thống (Global Constants)
export const DOCUMENT_TYPE_LABELS = {
  'ACADEMIC_RECORD': 'Học bạ',
  'CCCD': 'Căn cước công dân',
  'GRADUATION_CERT': 'Bằng tốt nghiệp (hoặc Giấy chứng nhận TN tạm thời)',
  'IELTS': 'Chứng chỉ Tiếng Anh (IELTS/TOEFL)',
  'TEST_RESULT': 'Kết quả thi ĐGNL',
  'PRIORITY_DOC': 'Giấy tờ ưu tiên',
  'ACHIEVEMENT': 'Thành tích/Giải thưởng',
  'OTHER': 'Giấy tờ khác'
};

export const PRIORITY_AREAS = [
  { value: 'KV1', label: 'Khu vực 1 (Ưu tiên 0.75)' },
  { value: 'KV2-NT', label: 'Khu vực 2-NT (Ưu tiên 0.5)' },
  { value: 'KV2', label: 'Khu vực 2 (Ưu tiên 0.25)' },
  { value: 'KV3', label: 'Khu vực 3 (Không ưu tiên)' }
];
