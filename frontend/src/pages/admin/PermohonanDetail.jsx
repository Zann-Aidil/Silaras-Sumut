import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Building2, Wrench, FileText, Download, Upload, AlertCircle, Save, Check } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { timelineDotClass } from '../../utils/statusColor';
import api from '../../api/axios';
import { toastSuccess, toastError } from '../../utils/swal';

export default function AdminPermohonanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  // Form states for status update
  const [status, setStatus] = useState('');
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [fileHasil, setFileHasil] = useState(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/permohonan/show.php?id=${id}`);
      const item = res.data.data;
      setData(item);
      setStatus(item.status);
      setCatatanAdmin(item.catatan_admin || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail tiket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);



  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('catatan_admin', catatanAdmin);
      if (fileHasil) {
        formData.append('dokumen_hasil', fileHasil);
      }

      await api.post(`/permohonan/status.php?id=${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toastSuccess('Status permohonan berhasil diperbarui');
      setFileHasil(null);
      fetchDetail(); // Reload detail to show the updated timeline and properties
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal memperbarui status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Proses Tiket" subtitle="Memuat data...">
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout title="Error" subtitle="Pemberitahuan">
        <div className="card text-center" style={{ maxWidth: 500, margin: '40px auto', padding: 24 }}>
          <AlertCircle size={40} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
          <h3>Detail Permohonan Tidak Ditemukan</h3>
          <p className="text-muted mb-4">{error || 'Data yang dicari tidak ditemukan.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/permohonan')}>
            Kembali ke Daftar
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Detail & Proses Permohonan" subtitle={`Mengelola Tiket ${data.kode_tiket}`}>
      {/* Back Button and Quick Info */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/permohonan')} className="btn btn-ghost btn-icon">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
              {data.kode_tiket}
            </span>
            <StatusBadge status={data.status} />
          </div>
          <p className="text-muted text-xs">Diajukan pada {formatDateTime(data.created_at)}</p>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Left Side: Ticket Details and Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Informasi Permohonan</h3>
            </div>
            <div className="card-body">
              <div className="grid-2 mb-4" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>
                <div>
                  <span className="text-xs text-muted font-medium">JENIS LAYANAN</span>
                  <p style={{ fontWeight: 600, fontSize: '1rem', marginTop: 2 }}>{data.nama_layanan}</p>
                  <p className="text-xs text-muted mt-1">Estimasi: {data.estimasi_waktu}</p>
                </div>
                <div>
                  <span className="text-xs text-muted font-medium">PRIORITAS TIKET</span>
                  <div style={{ marginTop: 2 }}>
                    <span className={`badge badge-priority-${data.prioritas?.toLowerCase()}`}>
                      {data.prioritas}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-xs text-muted font-medium">DESKRIPSI MASALAH PENGGUNA</span>
                <p style={{
                  whiteSpace: 'pre-wrap', marginTop: 6, fontSize: '0.9rem',
                  background: 'var(--surface-2)', padding: 16, borderRadius: 10,
                  border: '1px solid var(--border-light)', color: 'var(--text-primary)'
                }}>
                  {data.deskripsi_masalah}
                </p>
              </div>

              {data.lampiran && (
                <div>
                  <span className="text-xs text-muted font-medium">LAMPIRAN FILE PENGGUNA</span>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, marginTop: 6,
                    padding: 12, border: '1px solid var(--border)', borderRadius: 10,
                  }}>
                    <FileText size={20} style={{ color: 'var(--text-secondary)' }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontWeight: 500, fontSize: '0.85rem' }} className="truncate">
                        {data.lampiran.split('_').slice(1).join('_')}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dokumen Lampiran</p>
                    </div>
                    <a
                      href={`http://localhost/silaras-backend/uploads/lampiran/${data.lampiran}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm btn-icon"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Form (Proses Update Status) */}
          <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
            <div className="card-header">
              <h3 className="card-title">Tindakan & Penanganan Layanan</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleUpdateStatus}>
                <div className="form-group">
                  <label className="form-label" htmlFor="proc-status">Update Status Permohonan</label>
                  <select
                    id="proc-status"
                    className="form-control"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    required
                  >
                    <option value="Pending">Pending (Menunggu)</option>
                    <option value="Diproses">Diproses (Sedang Dikerjakan)</option>
                    <option value="Selesai">Selesai (Berhasil Ditangani)</option>
                    <option value="Ditolak">Ditolak (Permintaan Tidak Sesuai)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="proc-catatan">Catatan Tindakan / Alasan</label>
                  <textarea
                    id="proc-catatan"
                    className="form-control"
                    rows={4}
                    placeholder="Masukkan catatan penanganan, solusi yang dilakukan, atau alasan penolakan jika tiket ditolak..."
                    value={catatanAdmin}
                    onChange={e => setCatatanAdmin(e.target.value)}
                  />
                </div>

                {/* Upload Dokumen Hasil (Hanya jika status diset ke Selesai) */}
                {status === 'Selesai' && (
                  <div className="form-group" style={{ background: 'var(--success-bg)', padding: 16, borderRadius: 10, border: '1px solid #a7f3d0' }}>
                    <label className="form-label" htmlFor="proc-dokumen" style={{ color: 'var(--success-text)', fontWeight: 600 }}>
                      Upload Berita Acara / Dokumen Hasil Layanan
                    </label>
                    <input
                      id="proc-dokumen"
                      type="file"
                      className="form-control"
                      style={{ background: 'white' }}
                      onChange={e => setFileHasil(e.target.files[0])}
                    />
                    <span className="form-hint" style={{ color: 'var(--success-text)' }}>
                      Maks. 5MB. PDF, Word, JPG, atau ZIP sebagai tanda bukti penyelesaian layanan.
                    </span>
                    {data.dokumen_hasil && (
                      <div style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Dokumen saat ini: <strong>{data.dokumen_hasil.split('_').slice(1).join('_')}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                  <button type="submit" className="btn btn-primary" disabled={updating}>
                    <Save size={15} /> {updating ? 'Menyimpan...' : 'Simpan Penanganan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Applicant Metadata and Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Applicant Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Profil Pemohon</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: '1rem', flexShrink: 0
                }}>
                  {data.nama_pemohon?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{data.nama_pemohon}</h4>
                  <p className="text-xs text-muted">NIP. {data.nip || '-'}</p>
                </div>
              </div>

              <div className="divider" style={{ margin: '4px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.825rem' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Building2 size={14} className="text-muted" />
                  <span>{data.nama_instansi}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Phone size={14} className="text-muted" />
                  <span>{data.no_hp || '-'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Mail size={14} className="text-muted" />
                  <span>{data.email_pemohon}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status History Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Log Riwayat Tiket</h3>
            </div>
            <div className="card-body">
              <div className="timeline">
                {data.riwayat_status && data.riwayat_status.map((item, index) => (
                  <div key={item.id || index} className="timeline-item">
                    <div className={`timeline-dot ${timelineDotClass(item.status_baru)}`} />
                    <div className="timeline-content">
                      <div className="timeline-time">{formatDateTime(item.waktu)}</div>
                      <div className="timeline-status">
                        <strong>{item.status_baru}</strong>
                      </div>
                      {item.catatan && <div className="timeline-note">{item.catatan}</div>}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        Oleh: {item.nama_pengubah}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
