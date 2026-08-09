import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Building2, Hash, Eye, EyeOff, Shield, FileText, TrendingUp, FolderArchive } from 'lucide-react';
import api from '../../api/axios';
import Logo from '../../components/common/Logo';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: '', nip: '', email: '', password: '', konfirmasi: '',
    no_hp: '', instansi_id: '',
  });
  const [instansiNama, setInstansiNama] = useState('');
  const [instansiList, setInstansiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/instansi/public.php')
      .then(res => setInstansiList(res.data.data || []))
      .catch((err) => {
        console.error('Failed to load instansi list:', err);
        setInstansiList([]);
      });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password !== form.konfirmasi) {
      setError('Password dan konfirmasi password tidak sesuai');
      return;
    }
    setLoading(true);
    try {
      const { konfirmasi, ...payload } = form;
      // include instansi_nama if user supplied it (frontend-only field)
      if (instansiNama && !payload.instansi_id) payload.instansi_nama = instansiNama;
      await api.post('/auth/register.php', payload);
      setSuccess('Registrasi berhasil! Silakan login dengan akun Anda.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const featureList = [
    { icon: <FileText size={18} color="#60A5FA" />, text: 'Ajukan permohonan layanan TI secara digital' },
    { icon: <TrendingUp size={18} color="#34D399" />, text: 'Pantau status penanganan secara realtime' },
    { icon: <FolderArchive size={18} color="#FBBF24" />, text: 'Arsip lengkap seluruh riwayat layanan' }
  ];

  const f = (name, label, type = 'text', icon, placeholder, required = false) => (
    <div className="form-group">
      <label className="form-label" htmlFor={`reg-${name}`}>
        {label} {required && <span className="required">*</span>}
      </label>
      <div className="input-group">
        <span className="input-icon">{icon}</span>
        <input
          id={`reg-${name}`}
          name={name}
          type={type}
          className="form-control"
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          required={required}
        />
      </div>
    </div>
  );

  return (
    <div className="auth-layout">
      {/* Left Branding Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start',
        padding: '24px 40px', color: '#fff', maxWidth: 560,
      }} className="hide-mobile">
        <div style={{ marginBottom: 32 }}>
          <Logo size={200} variant="light" style={{ marginBottom: 8 }} />
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

      {/* Right Register Panel */}
      <div className="auth-panel" style={{ alignItems: 'flex-start', padding: '24px 28px' }}>
        <div className="auth-card" style={{ maxWidth: 540, padding: '20px 24px 24px' }}>
          <div className="auth-logo" style={{ marginBottom: 16, textAlign: 'center' }}>
            <Logo size={220} variant="dark" style={{ marginBottom: -24 }} />
            <h2 className="auth-title" style={{ fontSize: '1.35rem', fontWeight: 700, margin: '4px 0 2px', color: 'var(--text-primary)' }}>Daftar Akun SILARAS</h2>
            <p className="auth-subtitle" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Lengkapi data diri Anda sebagai staff OPD</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 16 }}>
              <Shield size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ gap: 0 }}>
              {f('nama', 'Nama Lengkap', 'text', <User size={16}/>, 'Nama sesuai KTP', true)}
              {f('nip', 'NIP', 'text', <Hash size={16}/>, 'Nomor Induk Pegawai')}
            </div>

            {f('email', 'Email Dinas', 'email', <Mail size={16}/>, 'nama@instansi.sumutprov.go.id', true)}

            <div className="form-group">
              <label className="form-label" htmlFor="reg-instansi">
                Instansi/OPD <span className="required">*</span>
              </label>
              <div className="input-group">
                <span className="input-icon"><Building2 size={16}/></span>
                <select
                  id="reg-instansi"
                  name="instansi_id"
                  className="form-control"
                  style={{ paddingLeft: 40 }}
                  value={form.instansi_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Pilih Instansi --</option>
                  {instansiList.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.singkatan ? `${i.singkatan} — ` : ''}{i.nama_instansi}
                    </option>
                  ))}
                </select>
              </div>
              {instansiList.length === 0 && (
                <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Daftar instansi tidak tersedia. Coba muat ulang halaman.
                </div>
              )}
            </div>

            {f('no_hp', 'Nomor HP/WA', 'tel', <Phone size={16}/>, '08xxxxxxxxxx')}

            <div className="grid-2" style={{ gap: 0 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password <span className="required">*</span>
                </label>
                <div className="input-group">
                  <span className="input-icon"><Lock size={16}/></span>
                  <input
                    id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                    className="form-control" placeholder="Min. 6 karakter"
                    style={{ paddingRight: 44 }}
                    value={form.password} onChange={handleChange} required minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-konfirmasi">
                  Konfirmasi Password <span className="required">*</span>
                </label>
                <div className="input-group">
                  <span className="input-icon"><Lock size={16}/></span>
                  <input
                    id="reg-konfirmasi" name="konfirmasi" type="password"
                    className="form-control" placeholder="Ulangi password"
                    value={form.konfirmasi} onChange={handleChange} required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading} style={{ marginTop: 12 }}>
              {loading ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  Mendaftarkan...
                </>
              ) : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Sudah punya akun?{' '}
            <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
              Masuk ke Sistem
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
