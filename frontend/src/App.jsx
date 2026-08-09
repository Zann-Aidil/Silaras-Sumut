import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import PermohonanList from './pages/user/PermohonanList';
import PermohonanBaru from './pages/user/PermohonanBaru';
import PermohonanDetail from './pages/user/PermohonanDetail';
import PermohonanEdit from './pages/user/PermohonanEdit';
import UserProfil from './pages/user/Profil';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminPermohonanList from './pages/admin/PermohonanList';
import AdminPermohonanDetail from './pages/admin/PermohonanDetail';
import JenisLayanan from './pages/admin/JenisLayanan';
import Instansi from './pages/admin/Instansi';
import Users from './pages/admin/Users';
import Laporan from './pages/admin/Laporan';
import AdminProfil from './pages/admin/Profil';

// ── Guard Components ──────────────────────────────────────
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: 16,
        background: 'var(--bg)'
      }}>
        <div style={{
          width: 52, height: 52, background: 'var(--primary)', borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: '#fff', fontSize: '1rem',
          animation: 'pulse 1.5s infinite',
        }}>SL</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Memuat SILARAS...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (role === 'user' && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Routes */}
          <Route path="/dashboard" element={<RequireAuth role="user"><UserDashboard /></RequireAuth>} />
          <Route path="/permohonan" element={<RequireAuth role="user"><PermohonanList /></RequireAuth>} />
          <Route path="/permohonan/baru" element={<RequireAuth role="user"><PermohonanBaru /></RequireAuth>} />
          <Route path="/permohonan/:id" element={<RequireAuth role="user"><PermohonanDetail /></RequireAuth>} />
          <Route path="/permohonan/:id/edit" element={<RequireAuth role="user"><PermohonanEdit /></RequireAuth>} />
          <Route path="/profil" element={<RequireAuth role="user"><UserProfil /></RequireAuth>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/permohonan" element={<RequireAuth role="admin"><AdminPermohonanList /></RequireAuth>} />
          <Route path="/admin/permohonan/:id" element={<RequireAuth role="admin"><AdminPermohonanDetail /></RequireAuth>} />
          <Route path="/admin/layanan" element={<RequireAuth role="admin"><JenisLayanan /></RequireAuth>} />
          <Route path="/admin/instansi" element={<RequireAuth role="admin"><Instansi /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth role="admin"><Users /></RequireAuth>} />
          <Route path="/admin/laporan" element={<RequireAuth role="admin"><Laporan /></RequireAuth>} />
          <Route path="/admin/profil" element={<RequireAuth role="admin"><AdminProfil /></RequireAuth>} />

          {/* 404 Catch-all */}
          <Route path="*" element={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '4rem', fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: 'var(--primary)' }}>404</div>
              <p style={{ color: 'var(--text-secondary)' }}>Halaman tidak ditemukan</p>
              <a href="/" className="btn btn-primary">Kembali ke Beranda</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
