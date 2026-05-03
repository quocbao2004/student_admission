import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE } from '../config';

/**
 * Định nghĩa flow nộp hồ sơ gồm 4 bước tuần tự.
 * Mỗi bước có:
 *   - key   : định danh
 *   - label : nhãn hiển thị
 *   - path  : route tương ứng
 */
export const FLOW_STEPS = [
  { key: 'profile',     label: 'Hoàn thiện Hồ sơ',  path: '/candidate/profile'     },
  { key: 'aspirations', label: 'Đăng ký Nguyện vọng', path: '/candidate/aspirations'  },
  { key: 'payment',     label: 'Thanh toán Lệ phí',  path: '/candidate/payment'      },
  { key: 'result',      label: 'Tra cứu Kết quả',    path: '/candidate/lookup'       },
];

/**
 * Trả về index bước tiếp theo thí sinh được phép vào,
 * dựa trên trạng thái hoàn thành.
 *
 * Rules:
 *   Bước 0 (profile)      → luôn mở khóa
 *   Bước 1 (aspirations)  → profile đã lưu (dob + gender + address)
 *   Bước 2 (payment)      → có ít nhất 1 nguyện vọng
 *   Bước 3 (result/lookup)→ đã thanh toán
 */
function calcUnlockedStepIndex(completion) {
  if (completion.hasPaid)          return 3;
  if (completion.hasAspirations)   return 2;
  // Cho phép sang bước nguyện vọng nếu đã lưu profile (hasProfile), 
  // nhưng dấu tích hoàn thành (Done) sẽ chỉ hiện khi isVerified (xử lý ở UI)
  if (completion.hasProfile)       return 1;
  return 0;
}

const AdmissionFlowContext = createContext(null);

export function AdmissionFlowProvider({ children }) {
  const { token, user } = useAuth();
  const [completion, setCompletion] = useState({
    hasProfile:      false, // Đã lưu thông tin
    isVerified:      false, // Admin đã duyệt hồ sơ
    hasAspirations:  false, // Có ít nhất 1 nguyện vọng
    hasPaid:         false, // Đã thanh toán lệ phí
  });
  const [isLoadingFlow, setIsLoadingFlow] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'CANDIDATE') {
      setIsLoadingFlow(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const [profileRes, paymentRes] = await Promise.all([
          fetch(`${API_BASE}/admissions/profile/me/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/admissions/payments/status/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        let updates = {
          hasProfile: false,
          isVerified: false,
          hasAspirations: false,
          hasPaid: false,
        };

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          // Profile is complete ONLY if they submitted it for verification (so status is not DRAFT)
          // or if they have filled out basic info. Let's rely on status.
          updates.hasProfile = profileData.status !== 'DRAFT';
          
          const verifiedStatuses = ['VERIFIED', 'PAID', 'RANKED', 'RESULT_PUBLISHED'];
          if (verifiedStatuses.includes(profileData.status)) {
            updates.isVerified = true;
          }
        }

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          if (paymentData.app_count > 0) {
            updates.hasAspirations = true;
          }
          if (paymentData.is_paid) {
            updates.hasPaid = true;
          }
        }

        setCompletion(prev => ({ ...prev, ...updates }));
      } catch (err) {
        console.error("Failed to fetch flow status:", err);
      } finally {
        setIsLoadingFlow(false);
      }
    };

    fetchStatus();
  }, [token, user]);

  /** Index bước hiện tại được phép truy cập (0-based). */
  const unlockedIndex = calcUnlockedStepIndex(completion);

  /** Cập nhật một hoặc nhiều milestone. */
  const updateCompletion = useCallback((updates) => {
    setCompletion((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Kiểm tra xem route có được phép truy cập không.
   * @param {string} path - pathname hiện tại
   * @returns {string | null} - path cần redirect về, hoặc null nếu ok
   */
  const getRedirectPath = useCallback(
    (path) => {
      const stepIndex = FLOW_STEPS.findIndex((s) => path.startsWith(s.path));
      // Không phải trang trong flow → không block
      if (stepIndex === -1) return null;
      // Trang dashboard luôn cho vào
      if (path.includes('dashboard')) return null;
      // Nếu thí sinh cố vào bước chưa mở khóa → đẩy về bước hợp lệ nhất
      if (stepIndex > unlockedIndex) {
        return FLOW_STEPS[unlockedIndex].path;
      }
      return null;
    },
    [unlockedIndex],
  );

  return (
    <AdmissionFlowContext.Provider
      value={{ completion, updateCompletion, unlockedIndex, getRedirectPath, FLOW_STEPS, isLoadingFlow }}
    >
      {children}
    </AdmissionFlowContext.Provider>
  );
}

export function useAdmissionFlow() {
  const ctx = useContext(AdmissionFlowContext);
  if (!ctx) throw new Error('useAdmissionFlow must be used within AdmissionFlowProvider');
  return ctx;
}
