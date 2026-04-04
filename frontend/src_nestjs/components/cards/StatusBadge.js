// Status Badge компонент
const statusConfig = {
  pending: { label: 'Ожидание', className: 'status-pending' },
  responded: { label: 'Есть ответы', className: 'status-confirmed' },
  accepted: { label: 'Принята', className: 'status-completed' },
  cancelled: { label: 'Отменена', className: 'status-cancelled' },
  expired: { label: 'Истекла', className: 'status-cancelled' },
  draft: { label: 'Черновик', className: 'status-pending' },
  confirmed: { label: 'Подтверждён', className: 'status-confirmed' },
  in_progress: { label: 'В работе', className: 'status-in_progress' },
  completed: { label: 'Завершён', className: 'status-completed' },
  no_show: { label: 'Неявка', className: 'status-cancelled' },
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'status-pending' };

  return (
    <span className={`status-badge ${config.className}`} data-testid={`status-${status}`}>
      {config.label}
    </span>
  );
}

export default StatusBadge;
