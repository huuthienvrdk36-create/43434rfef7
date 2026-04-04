// Booking Card компонент
import { ChevronRight, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export function BookingCard({ booking }) {
  const navigate = useNavigate();
  const snapshot = booking.snapshot || {};

  const formatDate = (date) => {
    if (!date) return 'Не назначена';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className="card card-interactive"
      onClick={() => navigate(`/bookings/${booking._id || booking.id}`)}
      data-testid={`booking-card-${booking._id || booking.id}`}
    >
      <div className="flex justify-between items-start mb-2">
        <StatusBadge status={booking.status} />
        <ChevronRight size={20} className="text-muted" />
      </div>

      <p className="font-semibold mb-1">
        {snapshot.serviceName || 'Услуга'}
      </p>
      
      <p className="text-primary font-bold text-lg mb-2">
        {snapshot.price ? `${snapshot.price.toLocaleString()} ₽` : '—'}
      </p>

      <div className="flex flex-col gap-1 text-sm text-muted">
        {snapshot.orgName && (
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span className="truncate">{snapshot.orgName}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>{formatDate(booking.scheduledAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default BookingCard;
