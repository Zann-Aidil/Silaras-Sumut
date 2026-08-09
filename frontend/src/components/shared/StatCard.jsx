export default function StatCard({ label, value, icon, color = 'primary', trendText, trendType = 'muted' }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className={`stat-icon-bubble ${color}`}>{icon}</div>
      </div>
      <div>
        <div className="stat-value">{value ?? 0}</div>
        {trendText && (
          <div className={`stat-trend ${trendType}`}>
            {trendText}
          </div>
        )}
      </div>
    </div>
  );
}
