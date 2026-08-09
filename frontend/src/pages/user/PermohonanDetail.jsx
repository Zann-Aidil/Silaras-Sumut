import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Calendar, Clock, AlertTriangle, ShieldCheck, Phone, Building2 } from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { timelineDotClass } from '../../utils/statusColor';
import api from '../../api/axios';

export default function PermohonanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/permohonan/show.php?id=${id}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail permohonan');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <UserLayout>
        <div style={{ padding: 80, textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p className="text-muted">Memuat detail permohonan...</p>
        </div>
      </UserLayout>
    );
  }

  if (error || !data) {
    return (
      <UserLayout>
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: 24, textAlign: 'center' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: 8 }}>Terjadi Kesalahan</h2>
          <p className="text-muted mb-6">{error || 'Data permohonan tidak ditemukan'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/permohonan')}>
            Kembali ke Daftar Permohonan
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/permohonan')} className="btn btn-ghost btn-icon">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem' }}>Detail Permohonan</h1>
            <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--border-light)', padding: '2px 8px', borderRadius: 6 }}>
              {data.kode_tiket}
            </span>
          </div>
          <p className="text-muted text-sm">Diajukan pada {formatDateTime(data.created_at)}</p>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Left Side: Info Permohonan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Rincian Masalah</h3>
              <StatusBadge status={data.status} />
            </div>
            <div className="card-body">
              <div className="grid-2 mb-4" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>
                <div>
                  <span className="text-xs text-muted font-medium">JENIS LAYANAN</span>
                  <p style={{ fontWeight: 600, fontSize: '1rem', marginTop: 2 }}>{data.nama_layanan}</p>
                </div>
                <div>
                  <span className="text-xs text-muted font-medium">PRIORITAS</span>
                  <div style={{ marginTop: 2 }}>
                    <span className={`badge badge-priority-${data.prioritas?.toLowerCase()}`}>
                      {data.prioritas}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-xs text-muted font-medium">DESKRIPSI MASALAH</span>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: 6, fontSize: '0.925rem', background: 'var(--surface-2)', padding: 16, borderRadius: 10, border: '1px solid var(--border-light)' }}>
                  {data.deskripsi_masalah}
                </p>
              </div>

              {data.lampiran && (
                <div>
                  <span className="text-xs text-muted font-medium">LAMPIRAN PENGGUNA</span>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, marginTop: 6,
                    padding: 12, border: '1px solid var(--border)', borderRadius: 10,
                  }}>
                    <FileText size={24} style={{ color: 'var(--text-secondary)' }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem' }} className="truncate">{data.lampiran.split('_').slice(1).join('_') || 'Lampiran'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dokumen Pendukung</p>
                    </div>
                    <a
                      href={`http://localhost/silaras-backend/uploads/lampiran/${data.lampiran}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm btn-icon"
                      title="Download Lampiran"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dokumen Hasil / Catatan dari Admin */}
          {(data.status === 'Selesai' || data.status === 'Ditolak' || data.catatan_admin) && (
            <div className="card" style={{ border: `1px solid var(--${data.status === 'Selesai' ? 'success' : data.status === 'Ditolak' ? 'danger' : 'border'})` }}>
              <div className="card-header" style={{ background: `var(--${data.status === 'Selesai' ? 'success' : data.status === 'Ditolak' ? 'danger' : 'surface'}-bg)` }}>
                <h3 className="card-title" style={{ color: `var(--${data.status === 'Selesai' ? 'success' : data.status === 'Ditolak' ? 'danger' : 'text-primary'}-text)` }}>
                  {data.status === 'Selesai' ? 'Laporan Hasil Penyelesaian' : data.status === 'Ditolak' ? 'Alasan Penolakan' : 'Catatan Petugas'}
                </h3>
              </div>
              <div className="card-body">
                {data.catatan_admin && (
                  <div className="mb-4">
                    <span className="text-xs text-muted font-medium">CATATAN PETUGAS DISKOMINFO</span>
                    <p style={{ whiteSpace: 'pre-wrap', marginTop: 6, fontSize: '0.925rem', background: 'var(--surface-2)', padding: 14, borderRadius: 8 }}>
                      {data.catatan_admin}
                    </p>
                  </div>
                )}

                {data.dokumen_hasil && (
                  <div>
                    <span className="text-xs text-muted font-medium">DOKUMEN HASIL LAYANAN</span>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12, marginTop: 6,
                      padding: 12, border: '1px solid var(--border)', borderRadius: 10,
                      background: 'var(--success-bg)'
                    }}>
                      <ShieldCheck size={24} style={{ color: 'var(--success)' }} />
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--success-text)' }} className="truncate">
                          {data.dokumen_hasil.split('_').slice(1).join('_') || 'Berita Acara/Laporan'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--success-text)' }}>Dokumen Resmi Hasil Layanan</p>
                      </div>
                      <a
                        href={`http://localhost/silaras-backend/uploads/hasil/${data.dokumen_hasil}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success btn-sm btn-icon"
                        title="Download Hasil"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div>
                    <strong>Ditangani oleh:</strong> {data.nama_admin || 'Staf Teknis'}
                  </div>
                  {data.tanggal_selesai && (
                    <div>
                      <strong>Selesai pada:</strong> {formatDateTime(data.tanggal_selesai)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Timeline Status & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Status Tracker */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Riwayat Status</h3>
            </div>
            <div className="card-body">
              <div className="timeline">
                {data.riwayat_status && data.riwayat_status.map((item, index) => (
                  <div key={item.id || index} className="timeline-item">
                    <div className={`timeline-dot ${timelineDotClass(item.status_baru)}`} />
                    <div className="timeline-content">
                      <div className="timeline-time">{formatDateTime(item.waktu)}</div>
                      <div className="timeline-status" style={{ color: `var(--text-primary)` }}>
                        Status: <strong>{item.status_baru}</strong>
                      </div>
                      {item.catatan && <div className="timeline-note">{item.catatan}</div>}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        Diubah oleh: {item.nama_pengubah}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Estimasi / Hubungi */}
          <div className="card" style={{ background: 'var(--primary)', color: '#fff' }}>
            <div className="card-body">
              <h4 style={{ color: '#fff', marginBottom: 8, fontSize: '0.95rem' }}>Butuh Tindak Lanjut?</h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>
                Silakan hubungi Helpdesk Diskominfo Sumut jika Anda membutuhkan bantuan mendesak atau klarifikasi lebih lanjut mengenai tiket ini.
              </p>
              <div style={{ fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={14} /> <strong>Telepon:</strong> 061-4515251
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={14} /> <strong>Kantor:</strong> Bidang Layanan E-Government
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
