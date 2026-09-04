import { useState, useEffect } from 'react';
import { User, Shield, Camera, Check, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toastSuccess, toastError } from '../../utils/swal';

export default function AdminProfil() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ nama: '', nip: '', no_hp: '', email: '' });
  const [pass, setPass] = useState({ password_lama: '', password_baru: '', konfirmasi: '' });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ nama: user.nama || '', nip: user.nip || '', no_hp: user.no_hp || '', email: user.email || '' });
      if (user.foto) setFotoPreview(`http://localhost/silaras-backend/uploads/foto/${user.foto}`);
    }
  }, [user]);



  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nama', form.nama);
      fd.append('nip', form.nip);
      fd.append('no_hp', form.no_hp);
      if (foto) fd.append('foto', foto);
      await api.post('/auth/profile.php', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const res = await api.get('/auth/profile.php');
      updateUser(res.data.data);
      toastSuccess('Profil berhasil diperbarui');
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (pass.password_baru !== pass.konfirmasi) {
      toastError('Password baru tidak sesuai dengan konfirmasi');
      return;
    }
    setLoadingPass(true);
    try {
      await api.put('/auth/profile.php', {
        nama: form.nama,
        password_lama: pass.password_lama,
        password_baru: pass.password_baru,
      });
      toastSuccess('Password berhasil diganti');
      setPass({ password_lama: '', password_baru: '', konfirmasi: '' });
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal mengganti password');
    } finally {
      setLoadingPass(false);
    }
  };

  const handleFotoChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFoto(f); setFotoPreview(URL.createObjectURL(f)); }
  };

  const initials = user?.nama?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'A';

  return (
    <AdminLayout title="Profil Admin" subtitle="Kelola data akun dan keamanan login Anda">
      <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Avatar Card */}
        <div className="card text-center" style={{ padding: '32px 20px' }}>
          <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto 20px' }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
              background: 'var(--primary)', color: '#fff', fontSize: '2.2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-md)', border: '4px solid white',
            }}>
              {fotoPreview
                ? <img src={fotoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <label htmlFor="admin-foto" style={{
              position: 'absolute', bottom: 4, right: 4,
              width: 32, height: 32, borderRadius: '50%', background: 'var(--secondary)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
            }}>
              <Camera size={14} />
              <input id="admin-foto" type="file" accept="image/*" onChange={handleFotoChange} style={{ display: 'none' }} />
            </label>
          </div>
          <h3 style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 4 }}>{form.nama}</h3>
          <span className="badge badge-diproses" style={{ margin: '0 auto' }}>Administrator</span>
          <div className="divider" />
          <div style={{ textAlign: 'left', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <div className="mb-4">
              <strong style={{ display: 'block', marginBottom: 2 }}>Email:</strong>
              <span style={{ color: 'var(--text-primary)' }}>{form.email}</span>
            </div>
            <div>
              <strong style={{ display: 'block', marginBottom: 2 }}>NIP:</strong>
              <span style={{ color: 'var(--text-primary)' }}>{form.nip || '-'}</span>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Edit Profile */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><User size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Informasi Profil</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleProfileSubmit}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="adm-nama">Nama Lengkap <span className="required">*</span></label>
                    <input id="adm-nama" type="text" className="form-control" value={form.nama}
                      onChange={e => setForm({ ...form, nama: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="adm-nip">NIP</label>
                    <input id="adm-nip" type="text" className="form-control" value={form.nip}
                      onChange={e => setForm({ ...form, nip: e.target.value })} />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="adm-hp">No. HP / WA</label>
                    <input id="adm-hp" type="text" className="form-control" value={form.no_hp}
                      onChange={e => setForm({ ...form, no_hp: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="adm-email">Email</label>
                    <input id="adm-email" type="text" className="form-control" value={form.email} disabled />
                    <span className="form-hint">Email tidak dapat diubah</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Shield size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Keamanan Akun</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handlePassSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="adm-plama">Password Sekarang <span className="required">*</span></label>
                  <input id="adm-plama" type="password" className="form-control" placeholder="Masukkan password saat ini"
                    value={pass.password_lama} onChange={e => setPass({ ...pass, password_lama: e.target.value })} required />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="adm-pbaru">Password Baru <span className="required">*</span></label>
                    <input id="adm-pbaru" type="password" className="form-control" placeholder="Min. 6 karakter"
                      value={pass.password_baru} onChange={e => setPass({ ...pass, password_baru: e.target.value })} required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="adm-pkonfirm">Konfirmasi Password Baru <span className="required">*</span></label>
                    <input id="adm-pkonfirm" type="password" className="form-control" placeholder="Ulangi password baru"
                      value={pass.konfirmasi} onChange={e => setPass({ ...pass, konfirmasi: e.target.value })} required />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }} disabled={loadingPass}>
                    {loadingPass ? 'Memproses...' : 'Ubah Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
