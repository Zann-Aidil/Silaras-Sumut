import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Wrench, Building2,
  Users, BarChart3, User, LogOut, Menu, X, Bell, Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import Logo from '../common/Logo';

const navItems = [
  { to: '/admin/dashboard',  icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/admin/permohonan', icon: <ClipboardList size={18} />,   label: 'Daftar Permohonan' },
  { to: '/admin/layanan',    icon: <Wrench size={18} />,          label: 'Manajemen Layanan' },
  { to: '/admin/instansi',   icon: <Building2 size={18} />,       label: 'Manajemen Instansi' },
  { to: '/admin/users',      icon: <Users size={18} />,           label: 'Manajemen User' },
  { to: '/admin/laporan',    icon: <BarChart3 size={18} />,       label: 'Laporan' },
  { to: '/admin/profil',     icon: <User size={18} />,            label: 'Profil' },
];

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.nama?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'A';

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Deep Midnight Navy) */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand" style={{ padding: '14px 12px' }}>
          <Logo fill variant="light" />
        </div>

        {/* Clean Navigation Menu */}
        <nav className="sidebar-nav" style={{ padding: '24px 12px' }}>
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
                  marginBottom: 6, transition: 'all 0.2s ease',
                  textDecoration: 'none'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 10,
              color: 'rgba(255, 255, 255, 0.65)', background: 'transparent',
              fontSize: '0.9rem', fontWeight: 400, width: '100%',
              border: 'none', cursor: 'pointer', marginTop: 12
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              id="sidebar-toggle"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Home size={15} />
              <span>/</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
            </div>
          </div>

          {/* User Profile Header Right */}
          <div className="header-actions" style={{ gap: 16 }}>
            <button className="btn btn-ghost btn-icon" title="Notifikasi">
              <Bell size={18} />
            </button>

            <Link to="/admin/profil" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {user?.nama || 'Diskominfo Staff'}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                  Administrator
                </div>
              </div>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)',
                color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '0.85rem', flexShrink: 0, overflow: 'hidden'
              }}>
                {user?.foto ? (
                  <img src={`http://localhost/silaras-backend/uploads/foto/${user.foto}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content page-enter">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
