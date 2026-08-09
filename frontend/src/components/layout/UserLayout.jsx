import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, User, LogOut, ChevronDown, Plus, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import Logo from '../common/Logo';

export default function UserLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.nama?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  const navLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { to: '/permohonan', icon: <ClipboardList size={16} />, label: 'Permohonan Saya' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav className="user-navbar">
        <div className="navbar-brand">
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
            <Logo size={152} variant="light" />
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                color: location.pathname === link.to ? '#fff' : 'rgba(255,255,255,0.75)',
                background: location.pathname === link.to ? 'rgba(255,255,255,0.18)' : 'transparent',
                fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s',
                textDecoration: 'none',
              }}
            >
              {link.icon}{link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="navbar-right">
          <Link to="/permohonan/baru" className="btn btn-accent btn-sm">
            <Plus size={15} /> Buat Permohonan
          </Link>

          {/* User dropdown */}
          <div style={{ position: 'relative' }}>
            <div className="navbar-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="navbar-avatar">
                {user?.foto
                  ? <img src={`http://localhost/silaras-backend/uploads/foto/${user.foto}`} alt="" />
                  : initials
                }
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="navbar-user-name">{user?.nama?.split(' ')[0]}</span>
                <span className="navbar-user-instansi">{user?.singkatan_instansi || user?.nama_instansi}</span>
              </div>
              <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.65)', flexShrink: 0 }} />
            </div>

            {dropdownOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setDropdownOpen(false)} />
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 6,
                  background: 'white', borderRadius: 12, boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-light)', minWidth: 200, zIndex: 99,
                  padding: '8px 0', overflow: 'hidden',
                }}>
                  <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user?.nama}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
                  </div>
                  <Link
                    to="/profil"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: '0.875rem', color: 'var(--text-primary)', textDecoration: 'none' }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={15} /> Edit Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: '0.875rem', color: 'var(--danger)', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="user-content page-enter">
        {children}
      </div>
    </div>
  );
}
