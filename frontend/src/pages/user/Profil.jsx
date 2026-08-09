import { useState, useEffect } from 'react';
import { User, Shield, Key, Camera, Check, AlertCircle } from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function Profil() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    nama: '',
    nip: '',
    no_hp: '',
    email: '',
    nama_instansi: '',
  });
  const [pass, setPass] = useState({
    password_lama: '',
    password_baru: '',
    konfirmasi: '',
  });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        nama: user.nama || '',
        nip: user.nip || '',
        no_hp: user.no_hp || '',
        email: user.email || '',
        nama_instansi: user.nama_instansi || '',
      });
      if (user.foto) {
        setFotoPreview(`http://localhost/silaras-backend/uploads/foto/${user.foto}`);
      }
    }
  }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nama', form.nama);
      formData.append('nip', form.nip);
      formData.append('no_hp', form.no_hp);
      if (foto) {
        formData.append('foto', foto);
      }

      // Gunakan POST dengan parameter query override method PUT karena PHP terkadang kesulitan memproses multipart/form-data pada request PUT
      await api.post('/auth/profile.php?_method=PUT', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Ambil profile terbaru untuk update global state
      const res = await api.get('/auth/profile.php');
      updateUser(res.data.data);
      showToast('Profil berhasil diperbarui');
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pass.password_baru !== pass.konfirmasi) {
      showToast('Password baru tidak sesuai dengan konfirmasi', 'error');
      return;
    }
    setLoadingPass(true);
    try {
      await api.put('/auth/profile.php', {
        nama: form.nama,
        password_lama: pass.password_lama,
        password_baru: pass.password_baru,
      });
      showToast('Password berhasil diganti');
      setPass({ password_lama: '', password_baru: '', konfirmasi: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengganti password', 'error');
    } finally {
      setLoadingPass(false);
    }
  };

  const handleFileChange = (e) => {
    const fileSelected = e.target.files[0];
    if (fileSelected) {
      setFoto(fileSelected);
      setFotoPreview(URL.createObjectURL(fileSelected));
    }
  };

  const initials = user?.nama?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  return (
    <UserLayout>
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
            {toast.msg}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', marginBottom: 4 }}>Pengaturan Profil</h1>
          <p className="text-muted text-sm">Kelola informasi pribadi dan keamanan akun Anda</p>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Left Side: Avatar Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card text-center" style={{ padding: '32px 20px' }}>
            <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 20px' }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                background: 'var(--primary)', color: '#fff', fontSize: '2.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-md)', border: '4px solid white',
              }}>
                {fotoPreview ? <img src={fotoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <label htmlFor="foto-upload" style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 34, height: 34, borderRadius: '50%', background: 'var(--secondary)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
              }} title="Ganti Foto">
                <Camera size={16} />
                <input id="foto-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>{form.nama}</h3>
            <p className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{user?.role}</p>
            <div className="divider" />
            <div style={{ textAlign: 'left', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <div className="mb-4">
                <strong>Instansi:</strong>
                <p style={{ marginTop: 2, color: 'var(--text-primary)' }}>{form.nama_instansi || '-'}</p>
              </div>
              <div>
                <strong>Email Terdaftar:</strong>
                <p style={{ marginTop: 2, color: 'var(--text-primary)' }}>{form.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Edit Profile Form */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><User size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Detail Profil</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleProfileSubmit}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-nama">Nama Lengkap <span className="required">*</span></label>
                    <input
                      id="prof-nama"
                      type="text"
                      className="form-control"
                      value={form.nama}
                      onChange={e => setForm({ ...form, nama: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-nip">NIP</label>
                    <input
                      id="prof-nip"
                      type="text"
                      className="form-control"
                      value={form.nip}
                      onChange={e => setForm({ ...form, nip: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-no-hp">Nomor HP / WhatsApp</label>
                    <input
                      id="prof-no-hp"
                      type="text"
                      className="form-control"
                      value={form.no_hp}
                      onChange={e => setForm({ ...form, no_hp: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-email-static">Email</label>
                    <input
                      id="prof-email-static"
                      type="text"
                      className="form-control"
                      value={form.email}
                      disabled
                    />
                    <span className="form-hint">Email tidak dapat diubah</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Shield size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Keamanan Akun</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-password-lama">Password Sekarang <span className="required">*</span></label>
                  <input
                    id="prof-password-lama"
                    type="password"
                    className="form-control"
                    placeholder="Masukkan password saat ini"
                    value={pass.password_lama}
                    onChange={e => setPass({ ...pass, password_lama: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-password-baru">Password Baru <span className="required">*</span></label>
                    <input
                      id="prof-password-baru"
                      type="password"
                      className="form-control"
                      placeholder="Min. 6 karakter"
                      value={pass.password_baru}
                      onChange={e => setPass({ ...pass, password_baru: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-konfirmasi">Konfirmasi Password Baru <span className="required">*</span></label>
                    <input
                      id="prof-konfirmasi"
                      type="password"
                      className="form-control"
                      placeholder="Ulangi password baru"
                      value={pass.konfirmasi}
                      onChange={e => setPass({ ...pass, konfirmasi: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" className="btn btn-outline" style={{ border: '1.5px solid var(--primary)', color: 'var(--primary)' }} disabled={loadingPass}>
                    {loadingPass ? 'Memproses...' : 'Ubah Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
