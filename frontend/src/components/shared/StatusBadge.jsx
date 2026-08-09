import { statusMap } from '../../utils/statusColor';

export default function StatusBadge({ status }) {
  const config = statusMap[status] || { label: status, class: '' };
  return (
    <span className={`badge ${config.class}`}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: config.dot, display: 'inline-block', flexShrink: 0
      }} />
      {config.label}
    </span>
  );
}
