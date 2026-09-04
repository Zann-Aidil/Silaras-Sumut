import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Send, ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../api/axios';
import { alertSuccess, alertError, toastError } from '../../utils/swal';

export default function PermohonanBaru() {
  const navigate = useNavigate();
  const [layananList, setLayananList] = useState([]);
  const [form, setForm] = useState({
    jenis_layanan_id: '',
    deskripsi_masalah: '',
    prioritas: 'Sedang',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/layanan/index.php?status=aktif')
      .then(res => setLayananList(res.data.data || []))
      .catch(() => {});
  }, []);

  const selectedLayanan = layananList.find(l => l.id == form.jenis_layanan_id);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.jenis_layanan_id) { toastError('Pilih jenis layanan terlebih dahulu'); return; }
    if (!form.deskripsi_masalah.trim()) { toastError('Deskripsi masalah wajib diisi'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('jenis_layanan_id', form.jenis_layanan_id);
      formData.append('deskripsi_masalah', form.deskripsi_masalah);
      formData.append('prioritas', form.prioritas);
      if (file) formData.append('lampiran', file);

      const res = await api.post('/permohonan/store.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const tiket = res.data.data?.kode_tiket;
      await alertSuccess('Permohonan Berhasil Diajukan!', `Kode tiket Anda: ${tiket}`);
      navigate('/permohonan');
    } catch (err) {
      alertError('Gagal Mengajukan', err.response?.data?.message || 'Gagal mengajukan permohonan');
    } finally {
      setLoading(false);
    }
  };

  const prioritasColors = { Rendah: 'success', Sedang: 'warning', Tinggi: 'danger' };

  return (
    <UserLayout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', marginBottom: 2 }}>
              Buat Permohonan Baru
            </h1>
            <p className="text-muted text-sm">Ajukan permintaan layanan TI kepada Diskominfo</p>
          </div>
        </div>


        <form onSubmit={handleSubmit}>
          {/* Jenis Layanan */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Informasi Layanan</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label" htmlFor="jenis-layanan">
                  Jenis Layanan <span className="required">*</span>
                </label>
                <select
                  id="jenis-layanan"
                  className="form-control"
                  value={form.jenis_layanan_id}
                  onChange={e => setForm({ ...form, jenis_layanan_id: e.target.value })}
                  required
                >
                  <option value="">-- Pilih Jenis Layanan --</option>
                  {layananList.map(l => (
                    <option key={l.id} value={l.id}>{l.nama_layanan}</option>
                  ))}
                </select>
              </div>

              {selectedLayanan && (
                <div style={{
                  background: 'var(--info-bg)', border: '1px solid #bfdbfe',
                  borderRadius: 10, padding: '14px 16px', marginTop: -8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--info-text)', marginBottom: 4 }}>{selectedLayanan.nama_layanan}</p>
                      <p style={{ fontSize: '0.825rem', color: 'var(--info-text)' }}>{selectedLayanan.deskripsi}</p>
                    </div>
                    <span className="badge badge-diproses">
                      ⏱ {selectedLayanan.estimasi_waktu}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: 20 }}>
                <label className="form-label" htmlFor="prioritas">Prioritas</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {['Rendah', 'Sedang', 'Tinggi'].map(p => (
                    <label
                      key={p}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${form.prioritas === p ? 'var(--' + (p === 'Tinggi' ? 'danger' : p === 'Sedang' ? 'warning' : 'success') + ')' : 'var(--border)'}`,
                        background: form.prioritas === p ? 'var(--' + (p === 'Tinggi' ? 'danger' : p === 'Sedang' ? 'warning' : 'success') + '-bg)' : 'var(--surface)',
                        transition: 'all 0.2s',
                        flex: 1, justifyContent: 'center',
                      }}
                    >
                      <input
                        type="radio" name="prioritas" value={p} hidden
                        checked={form.prioritas === p}
                        onChange={e => setForm({ ...form, prioritas: e.target.value })}
                      />
                      <span style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: p === 'Rendah' ? '#10B981' : p === 'Sedang' ? '#F59E0B' : '#EF4444',
                        display: 'inline-block'
                      }} />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p}</span>
                    </label>
                  ))}
                </div>
                {form.prioritas === 'Tinggi' && (
                  <p className="form-hint" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} /> Prioritas Tinggi digunakan untuk masalah yang mengganggu operasional kerja secara signifikan.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Deskripsi Masalah</h3>
            </div>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="deskripsi">
                  Jelaskan masalah secara detail <span className="required">*</span>
                </label>
                <textarea
                  id="deskripsi"
                  className="form-control"
                  rows={6}
                  placeholder="Deskripsikan masalah yang Anda alami, termasuk kapan terjadi, gejala yang muncul, dan langkah yang sudah dicoba..."
                  value={form.deskripsi_masalah}
                  onChange={e => setForm({ ...form, deskripsi_masalah: e.target.value })}
                  required
                  minLength={20}
                />
                <p className="form-hint">
                  Minimum 20 karakter. Semakin detail deskripsi, semakin cepat penanganan.
                </p>
              </div>
            </div>
          </div>

          {/* Lampiran */}
          <div className="card mb-6">
            <div className="card-header">
              <h3 className="card-title">Lampiran <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Opsional)</span></h3>
            </div>
            <div className="card-body">
              <label className="file-upload-area" htmlFor="lampiran" style={{ cursor: 'pointer' }}>
                <input
                  id="lampiran"
                  type="file"
                  onChange={e => setFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                />
                <Upload size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                {file ? (
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontWeight: 500, marginBottom: 4 }}>Klik atau seret file ke sini</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      PDF, Word, Excel, JPG, PNG, ZIP — Maks. 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? (
                <><div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Mengajukan...</>
              ) : (
                <><Send size={16} /> Ajukan Permohonan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}
