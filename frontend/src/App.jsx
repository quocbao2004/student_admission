import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CandidateLayout from './layouts/CandidateLayout';
import AdminLayout from './layouts/AdminLayout';

// Public & Auth Pages
import Home from './pages/public/Home';
import Majors from './pages/public/Majors';
import Methods from './pages/public/Methods';
import Benchmarks from './pages/public/Benchmarks';
import Contact from './pages/public/Contact';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Candidate Pages
import CandidateDashboard from './pages/candidate/Dashboard';
import Profile from './pages/candidate/Profile';
import Aspirations from './pages/candidate/Aspirations';
import Lookup from './pages/candidate/Lookup';
import Payment from './pages/candidate/Payment';
import AdmissionLetter from './pages/candidate/AdmissionLetter';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Catalogs from './pages/admin/Catalogs';
import Verifications from './pages/admin/Verifications';
import Formulas from './pages/admin/Formulas';
import Admissions from './pages/admin/Admissions';
import Seasons from './pages/admin/Seasons';

import './App.css';

// Component bảo vệ Route dựa trên Role
const ProtectedRoute = ({ children, allowedRole }) => {
  const { token, user } = useAuth();
  
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="majors" element={<Majors />} />
            <Route path="methods" element={<Methods />} />
            <Route path="benchmarks" element={<Benchmarks />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Candidate Portal - STUDENT ONLY */}
          <Route path="/candidate" element={
            <ProtectedRoute allowedRole="STUDENT">
              <CandidateLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CandidateDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="aspirations" element={<Aspirations />} />
            <Route path="lookup" element={<Lookup />} />
            <Route path="payment" element={<Payment />} />
            <Route path="admission-letter" element={<AdmissionLetter />} />
          </Route>

          {/* Admin Portal - ADMIN ONLY */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="catalogs" element={<Catalogs />} />
            <Route path="verifications" element={<Verifications />} />
            <Route path="formulas" element={<Formulas />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="seasons" element={<Seasons />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
