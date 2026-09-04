import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle, XCircle, Plus, ArrowRight, FileText } from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatRelative } from '../../utils/formatDate';
import api from '../../api/axios';

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, diproses: 0, selesai: 0, ditolak: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/permohonan/index.php?per_page=5'),
      api.get('/laporan/index.php?type=summary'),
    ]).then(([recentRes, statsRes]) => {
      setRecent(recentRes.data.data || []);
      // Hitung dari permohonan sendiri — filter dari hasil
      const items = recentRes.data.data || [];
      const all = recentRes.data.pagination?.total || 0;

      // Ambil semua untuk hitung stats user
      api.get('/permohonan/index.php?per_page=500').then(allRes => {
        const allItems = allRes.data.data || [];
        setStats({
          total:    allItems.length,
          pending:  allItems.filter(i => i.status === 'Pending').length,
          diproses: allItems.filter(i => i.status === 'Diproses').length,
          selesai:  allItems.filter(i => i.status === 'Selesai').length,
          ditolak:  allItems.filter(i => i.status === 'Ditolak').length,
        });
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <UserLayout>
      {/* Welcome Banner */}
      <div className="welcome-banner" style={{
        backgroundImage: 'linear-gradient(135deg, rgba(27,58,107,0.92) 0%, rgba(45,108,192,0.85) 100%), url("/banner.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="welcome-text" style={{ position: 'relative', zIndex: 1 }}>
          <h2>Selamat Datang, {user?.nama?.split(' ')[0]}!</h2>
          <p>
            {user?.nama_instansi || 'Staff OPD'} &nbsp;·&nbsp; {formatDate(new Date().toISOString())}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-6" style={{ gap: 20 }}>
        <StatCard label="TOTAL PERMOHONAN" value={stats.total} color="navy" variant="colored"
          icon={<ClipboardList size={22} />} trendText="📋 Total diajukan" />
        <StatCard label="MENUNGGU DIPROSES" value={stats.pending} color="orange" variant="colored"
          icon={<Clock size={22} />} trendText="⏳ Menunggu penanganan" />
        <StatCard label="SEDANG DIPROSES" value={stats.diproses} color="cyan" variant="colored"
          icon={<FileText size={22} />} trendText="⚡ Sedang ditangani" />
        <StatCard label="SELESAI" value={stats.selesai} color="green" variant="colored"
          icon={<CheckCircle size={22} />} trendText="✅ Berhasil diselesaikan" />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6">
        <Link to="/permohonan/baru" className="btn btn-primary">
          <Plus size={17} /> Buat Permohonan Baru
        </Link>
        <Link to="/permohonan" className="btn btn-outline">
          <ClipboardList size={17} /> Lihat Semua Permohonan
        </Link>
      </div>

      {/* Recent Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Permohonan Terbaru</h3>
          <Link to="/permohonan" className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : recent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><ClipboardList size={36} /></div>
              <div className="empty-title">Belum ada permohonan</div>
              <div className="empty-desc">Ajukan permohonan layanan TI pertama Anda</div>
              <Link to="/permohonan/baru" className="btn btn-primary">
                <Plus size={16} /> Buat Permohonan
              </Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>No. Tiket</th>
                    <th>Jenis Layanan</th>
                    <th>Prioritas</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(item => (
                    <tr key={item.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                          {item.kode_tiket}
                        </span>
                      </td>
                      <td>{item.nama_layanan}</td>
                      <td>
                        <span className={`badge badge-priority-${item.prioritas?.toLowerCase()}`}>
                          {item.prioritas}
                        </span>
                      </td>
                      <td><StatusBadge status={item.status} /></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                        {formatRelative(item.created_at)}
                      </td>
                      <td>
                        <Link to={`/permohonan/${item.id}`} className="btn btn-ghost btn-sm">
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
