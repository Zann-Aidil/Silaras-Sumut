import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, Clock, CheckCircle2, Users, RefreshCw,
  AlertTriangle, ArrowUpRight, TrendingUp, ChevronRight, Home
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatDate, formatRelative } from '../../utils/formatDate';
import api from '../../api/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, diproses: 0, selesai: 0, total_users: 0 });
  const [urgentTickets, setUrgentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Weekly');

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      api.get('/laporan/index.php?type=summary'),
      api.get('/permohonan/index.php?prioritas=Tinggi&per_page=3'),
      api.get('/users/index.php?per_page=1'),
    ]).then(([summaryRes, urgentRes, usersRes]) => {
      const s = summaryRes.data.data || {};
      setStats({
        total:       s.total || 0,
        pending:     s.pending || 0,
        diproses:    s.diproses || 0,
        selesai:     s.selesai || 0,
        total_users: usersRes.data.pagination?.total || 5,
      });
      setUrgentTickets(urgentRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Bar Chart Data (Requests per Instansi)
  const barChartData = {
    labels: ['Biro Umum', 'Dinkes', 'Bappeda', 'Disdik', 'Diskominfo'],
    datasets: [
      {
        label: 'Permohonan Masuk',
        data: [28, 46, 14, 37, 56],
        backgroundColor: '#08162A',
        borderRadius: 6,
      },
      {
        label: 'Selesai',
        data: [9, 10, 9, 9, 9],
        backgroundColor: '#CBD5E1',
        borderRadius: 6,
      }
    ]
  };

  // Line Chart Data (Monthly Trend Analysis)
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        fill: true,
        label: 'Volume Permohonan',
        data: [15, 22, 18, 30, 27, 45, 34, 48, 40, 52, 49, 58],
        borderColor: '#08162A',
        borderWidth: 2.5,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(8, 22, 42, 0.15)');
          gradient.addColorStop(1, 'rgba(8, 22, 42, 0.0)');
          return gradient;
        },
        tension: 0.35,
        pointBackgroundColor: '#08162A',
        pointRadius: 4,
      }
    ]
  };

  return (
    <AdminLayout title="Overview" subtitle="High-level view of system performance and active requests.">
      {/* Top Bar Action (Refresh) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Home size={13} /> / <strong>Admin Dashboard</strong>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>Overview</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            High-level view of system performance and active requests.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={fetchDashboardData} disabled={loading} style={{ borderRadius: 8 }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid-4 mb-6" style={{ gap: 20 }}>
        <StatCard
          label="Permohonan Masuk"
          value={stats.total}
          icon={<ClipboardList size={20} />}
          color="primary"
          trendText="+12% minggu ini"
          trendType="up"
        />
        <StatCard
          label="Perlu Diproses"
          value={stats.pending + stats.diproses}
          icon={<Clock size={20} />}
          color="warning"
          trendText={`${stats.pending} permohonan mendesak`}
          trendType="warning"
        />
        <StatCard
          label="Selesai Hari Ini"
          value={stats.selesai}
          icon={<CheckCircle2 size={20} />}
          color="info"
          trendText="Sesuai target harian"
          trendType="up"
        />
        <StatCard
          label="Total User Aktif"
          value={stats.total_users}
          icon={<Users size={20} />}
          color="purple"
          trendText="Terdaftar di sistem"
          trendType="muted"
        />
      </div>

      {/* Middle Grid: Requests per Instansi Bar Chart + Urgent Requests Panel */}
      <div className="grid-3 mb-6" style={{ gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left: Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Requests per Instansi</h3>
            <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', padding: 3, borderRadius: 8 }}>
              {['Weekly', 'Monthly'].map(m => (
                <button
                  key={m}
                  onClick={() => setPeriod(m)}
                  style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                    background: period === m ? '#FFFFFF' : 'transparent',
                    color: period === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: period === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body" style={{ height: 320, padding: 20 }}>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: '#F1F3F7' }, max: 100 }
                }
              }}
            />
          </div>
        </div>

        {/* Right: Urgent Requests Container (Purple Pastel Box like Mockup) */}
        <div style={{
          background: '#EEECFB', borderRadius: 20, padding: 20,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#1E1B4B' }}>
                  Urgent Requests
                </h3>
              </div>
              <span className="badge" style={{ background: '#DC2626', color: '#FFFFFF', fontWeight: 700 }}>
                {urgentTickets.length || 3} High
              </span>
            </div>

            {/* Ticket Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {urgentTickets.length === 0 ? (
                [
                  { title: 'Server Down - Data Center', time: '10m ago', desc: 'Biro Umum melaporkan server aplikasi tidak dapat diakses...', tag: 'BU', instansi: 'Biro Umum' },
                  { title: 'Jaringan Terputus - Lantai 3', time: '1h ago', desc: 'Koneksi internet di lantai 3 terputus, mengganggu proses input...', tag: 'DK', instansi: 'Dinas Kesehatan' },
                  { title: 'Reset Password Admin SIMDA', time: '2h ago', desc: 'Mohon segera direset karena perlu approve dokumen penting...', tag: 'BK', instansi: 'BKD' },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: '#FFFFFF', borderRadius: 12, padding: 14,
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                    borderLeft: '4px solid #DC2626'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>{item.title}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{item.time}</span>
                    </div>
                    <p style={{ fontSize: '0.775rem', color: '#64748B', lineHeight: 1.3, marginBottom: 8 }} className="truncate">
                      {item.desc}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        background: '#F1F5F9', color: '#334155', fontWeight: 700,
                        fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4
                      }}>{item.tag}</span>
                      <span style={{ fontSize: '0.725rem', color: '#64748B' }}>{item.instansi}</span>
                    </div>
                  </div>
                ))
              ) : (
                urgentTickets.map(item => (
                  <Link key={item.id} to={`/admin/permohonan/${item.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: '#FFFFFF', borderRadius: 12, padding: 14,
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                      borderLeft: '4px solid #DC2626'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>{item.nama_layanan}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{formatRelative(item.created_at)}</span>
                      </div>
                      <p style={{ fontSize: '0.775rem', color: '#64748B', lineHeight: 1.3, marginBottom: 8 }} className="truncate">
                        {item.deskripsi_masalah}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          background: '#F1F5F9', color: '#334155', fontWeight: 700,
                          fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4
                        }}>{item.singkatan_instansi || 'OPD'}</span>
                        <span style={{ fontSize: '0.725rem', color: '#64748B' }}>{item.nama_pemohon}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <Link to="/admin/permohonan?prioritas=Tinggi" style={{
            textAlign: 'center', display: 'block', marginTop: 16,
            fontSize: '0.825rem', fontWeight: 700, color: '#4338CA', textDecoration: 'none'
          }}>
            View All Urgent Tickets →
          </Link>
        </div>
      </div>

      {/* Bottom Chart: Monthly Trend Analysis */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Monthly Trend Analysis</h3>
        </div>
        <div className="card-body" style={{ height: 260, padding: 20 }}>
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: { display: false }
              }
            }}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
