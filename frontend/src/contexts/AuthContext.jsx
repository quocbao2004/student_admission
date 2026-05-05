import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const navigate = useNavigate();

  // Lấy thông tin user đầy đủ từ API /me/
  const fetchMe = useCallback(async (accessToken) => {
    try {
      const res = await fetch(`${API_BASE}/accounts/me/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
      }
    } catch (_) {
      // Không làm gì nếu mạng lỗi
    }
    return null;
  }, []);

  const login = async (access_token, refresh_token) => {
    localStorage.setItem('token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    setToken(access_token);
    // Lấy thông tin user đầy đủ ngay sau khi có token
    const userData = await fetchMe(access_token);
    
    // Điều hướng dựa trên role
    if (userData && userData.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/candidate/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};
