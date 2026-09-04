export default function StatCard({
  label,
  value,
  icon,
  color = 'navy',
  trendText,
  trendType = 'muted',
  subtitle,
  variant = 'colored' // 'colored' or 'plain'
}) {
  if (variant === 'colored') {
    const bgClass = `stat-card-colored stat-card-${color}`;
    return (
      <div className={bgClass}>
        <div className="stat-header">
          <span className="stat-label-colored">{label}</span>
          <div className="stat-icon-bubble-colored">
            {icon}
          </div>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div className="stat-value-colored">{value ?? 0}</div>
          {(trendText || subtitle) && (
            <div className="stat-footer-colored">
              {trendText || subtitle}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className={`stat-icon-bubble ${color}`}>{icon}</div>
      </div>
      <div>
        <div className="stat-value">{value ?? 0}</div>
        {(trendText || subtitle) && (
          <div className={`stat-trend ${trendType}`}>
            {trendText || subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

