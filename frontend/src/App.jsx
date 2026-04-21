import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CandidateLayout from './layouts/CandidateLayout';
import AdminLayout from './layouts/AdminLayout';

// Public & Auth Pages
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Candidate Pages
import CandidateDashboard from './pages/candidate/Dashboard';
import Profile from './pages/candidate/Profile';
import Aspirations from './pages/candidate/Aspirations';
import Lookup from './pages/candidate/Lookup';
import Payment from './pages/candidate/Payment';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Catalogs from './pages/admin/Catalogs';
import Verifications from './pages/admin/Verifications';
import Formulas from './pages/admin/Formulas';
import Admissions from './pages/admin/Admissions';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes with PublicLayout */}
          <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Candidate Portal Routes */}
        <Route path="/candidate" element={<CandidateLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="aspirations" element={<Aspirations />} />
          <Route path="lookup" element={<Lookup />} />
          <Route path="payment" element={<Payment />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="catalogs" element={<Catalogs />} />
          <Route path="verifications" element={<Verifications />} />
          <Route path="formulas" element={<Formulas />} />
          <Route path="admissions" element={<Admissions />} />
        </Route>
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

