import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../api/axios';

export default function PermohonanEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [layananList, setLayananList] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    jenis_layanan_id: '',
    deskripsi_masalah: '',
    prioritas: 'Sedang',
  });

  useEffect(() => {
    Promise.all([
      api.get(`/permohonan/show.php?id=${id}`),
      api.get('/layanan/index.php?status=aktif'),
    ]).then(([detailRes, layananRes]) => {
      const p = detailRes.data.data;
      if (p.status !== 'Pending') {
        setError('Hanya permohonan berstatus Pending yang dapat diedit.');
        return;
      }
      setForm({
        jenis_layanan_id: p.jenis_layanan_id,
        deskripsi_masalah: p.deskripsi_masalah,
        prioritas: p.prioritas,
      });
      setLayananList(layananRes.data.data || []);
    }).catch(() => {
      setError('Gagal memuat data permohonan.');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/permohonan/update.php?id=${id}`, form);
      navigate(`/permohonan/${id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div style={{ padding: 80, textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', marginBottom: 2 }}>Edit Permohonan</h1>
            <p className="text-muted text-sm">Ubah informasi permohonan (hanya saat berstatus Pending)</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-6">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!error && (
          <form onSubmit={handleSubmit}>
            <div className="card mb-4">
              <div className="card-header"><h3 className="card-title">Informasi Layanan</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-layanan">Jenis Layanan <span className="required">*</span></label>
                  <select
                    id="edit-layanan"
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

                <div className="form-group">
                  <label className="form-label">Prioritas</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['Rendah', 'Sedang', 'Tinggi'].map(p => (
                      <label key={p} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${form.prioritas === p ? 'var(--secondary)' : 'var(--border)'}`,
                        background: form.prioritas === p ? 'var(--info-bg)' : 'var(--surface)',
                        fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s',
                      }}>
                        <span style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: p === 'Rendah' ? '#10B981' : p === 'Sedang' ? '#F59E0B' : '#EF4444',
                          display: 'inline-block'
                        }} />
                        <span>{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-6">
              <div className="card-header"><h3 className="card-title">Deskripsi Masalah</h3></div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  rows={7}
                  placeholder="Deskripsi masalah yang dihadapi..."
                  value={form.deskripsi_masalah}
                  onChange={e => setForm({ ...form, deskripsi_masalah: e.target.value })}
                  required
                  minLength={20}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={15} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </UserLayout>
  );
}
