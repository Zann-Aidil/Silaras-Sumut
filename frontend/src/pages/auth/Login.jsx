import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, FileText, TrendingUp, FolderArchive } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const featureList = [
    { icon: <FileText size={18} color="#60A5FA" />, text: 'Ajukan permohonan layanan TI secara digital' },
    { icon: <TrendingUp size={18} color="#34D399" />, text: 'Pantau status penanganan secara realtime' },
    { icon: <FolderArchive size={18} color="#FBBF24" />, text: 'Arsip lengkap seluruh riwayat layanan' }
  ];

  return (
    <div className="auth-layout">
      {/* Left Branding Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '20px 64px', color: '#fff', maxWidth: 560,
      }} className="hide-mobile">
        <div style={{ marginBottom: 32 }}>
          <Logo size={240} variant="light" style={{ marginBottom: -15 }} />
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, marginTop: 8 }}>
            Sistem Informasi Layanan dan Arsip<br />
            <strong style={{ fontSize: '1.25rem' }}>Diskominfo Provinsi Sumatera Utara</strong>
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {featureList.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '1rem', color: 'rgba(255,255,255,0.92)' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {item.icon}
              </div>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, padding: '20px 24px', background: 'rgba(255,255,255,0.08)', borderRadius: 16, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Layanan tersedia untuk</p>
          <p style={{ fontWeight: 600, fontSize: '1.05rem' }}>Staff OPD di Lingkungan Kantor Gubernur Sumatera Utara</p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="auth-panel">
        <div className="auth-card" style={{ maxWidth: 480, padding: '32px 36px 38px' }}>
          <div className="auth-logo" style={{ marginBottom: 16, textAlign: 'center' }}>
            <Logo size={220} variant="dark" style={{ marginBottom: -24 }} />
            <p className="auth-subtitle" style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>Masukkan kredensial akun dinas Anda</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 16 }}>
              <Shield size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Dinas <span className="required">*</span>
              </label>
              <div className="input-group">
                <span className="input-icon"><Mail size={16} /></span>
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  placeholder="nama@instansi.sumutprov.go.id"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password <span className="required">*</span>
              </label>
              <div className="input-group">
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
              style={{ marginTop: 12 }}
            >
              {loading ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  Masuk...
                </>
              ) : 'Masuk ke Sistem'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Belum punya akun?{' '}
            <Link to="/register" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
              Daftar Sekarang
            </Link>
          </p>

          <p style={{ marginTop: 20, fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            © 2026 Dinas Komunikasi dan Informatika Provinsi Sumatera Utara
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .hide-mobile { display: none !important; } }
      `}</style>
    </div>
  );
}
