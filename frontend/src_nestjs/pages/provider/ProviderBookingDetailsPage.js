// Provider Booking Details - управление статусом заказа
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../lib/api/client';
import TopBar from '../../components/navigation/TopBar';
import StatusBadge from '../../components/cards/StatusBadge';
import { LoadingOverlay, EmptyState, LoadingSpinner } from '../../components/layout/LoadingStates';
import { 
  User, 
  Calendar, 
  MapPin,
  Phone,
  AlertCircle,
  Check,
  Play,
  X
} from 'lucide-react';

const statusActions = {
  pending: [
    { status: 'confirmed', label: 'Подтвердить', icon: Check, primary: true },
    { status: 'cancelled', label: 'Отменить', icon: X, danger: true },
  ],
  confirmed: [
    { status: 'in_progress', label: 'Начать работу', icon: Play, primary: true },
    { status: 'no_show', label: 'Неявка', icon: X, danger: true },
    { status: 'cancelled', label: 'Отменить', icon: X, danger: true },
  ],
  in_progress: [
    { status: 'completed', label: 'Завершить', icon: Check, primary: true },
    { status: 'cancelled', label: 'Отменить', icon: X, danger: true },
  ],
};

export function ProviderBookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await bookingsAPI.getById(id);
        setBooking(response.data);
      } catch (error) {
        console.error('Failed to fetch booking:', error);
        setError('Заказ не найден');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (updating) return;

    // Confirm dangerous actions
    if (['cancelled', 'no_show'].includes(newStatus)) {
      if (!window.confirm(`Вы уверены, что хотите ${newStatus === 'cancelled' ? 'отменить заказ' : 'отметить неявку'}?`)) {
        return;
      }
    }

    setUpdating(newStatus);
    try {
      const response = await bookingsAPI.updateStatus(id, newStatus);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(error.response?.data?.message || 'Ошибка обновления статуса');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Не назначена';
    return new Date(date).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <LoadingOverlay />;

  if (error) {
    return (
      <div className="mobile-shell">
        <TopBar title="Заказ" showBack />
        <EmptyState 
          icon={AlertCircle}
          title="Ошибка"
          description={error}
          action={
            <button className="btn btn-primary mt-4" onClick={() => navigate('/provider/bookings')}>
              К заказам
            </button>
          }
        />
      </div>
    );
  }

  const snapshot = booking?.snapshot || {};
  const actions = statusActions[booking?.status] || [];
  const isTerminal = ['completed', 'cancelled', 'no_show'].includes(booking?.status);

  return (
    <div className="mobile-shell" style={{ paddingBottom: 0 }}>
      <TopBar title="Заказ" showBack />

      {/* Status */}
      <section className="section">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Статус</h2>
          <StatusBadge status={booking?.status} />
        </div>

        {/* Quick Status Actions */}
        {!isTerminal && actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action) => (
              <button
                key={action.status}
                className={`btn flex-1 ${action.primary ? 'btn-primary' : action.danger ? 'btn-ghost' : 'btn-secondary'}`}
                style={action.danger ? { color: 'hsl(var(--destructive))' } : undefined}
                onClick={() => handleStatusChange(action.status)}
                disabled={updating !== null}
                data-testid={`action-${action.status}`}
              >
                {updating === action.status ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <action.icon size={18} />
                    {action.label}
                  </>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Service Info */}
      <section className="section">
        <h3 className="font-bold mb-4">Услуга</h3>
        <div className="card">
          <p className="font-semibold text-lg">{snapshot.serviceName || 'Услуга'}</p>
          {snapshot.categoryName && (
            <p className="text-sm text-muted">{snapshot.categoryName}</p>
          )}
          <div className="flex justify-between items-center pt-3 mt-3 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <span className="text-muted">Стоимость:</span>
            <span className="text-2xl font-bold text-primary">
              {snapshot.price?.toLocaleString() || '—'} ₽
            </span>
          </div>
        </div>
      </section>

      {/* Customer Info */}
      <section className="section">
        <h3 className="font-bold mb-4">Клиент</h3>
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <User size={24} className="text-muted" />
            </div>
            <div>
              <p className="font-semibold">{snapshot.customerName || 'Клиент'}</p>
              {snapshot.customerPhone && (
                <p className="text-sm text-muted">{snapshot.customerPhone}</p>
              )}
            </div>
          </div>

          {snapshot.customerPhone && (
            <a 
              href={`tel:${snapshot.customerPhone}`}
              className="btn btn-secondary"
            >
              <Phone size={18} />
              Позвонить
            </a>
          )}
        </div>
      </section>

      {/* Schedule */}
      <section className="section">
        <h3 className="font-bold mb-4">Дата и время</h3>
        <div className="card">
          <div className="flex items-center gap-3">
            <Calendar size={24} className="text-primary" />
            <p className="font-medium">{formatDate(booking?.scheduledAt)}</p>
          </div>
        </div>
      </section>

      {/* Branch Info */}
      {snapshot.branchName && (
        <section className="section" style={{ paddingBottom: '2rem' }}>
          <h3 className="font-bold mb-4">Филиал</h3>
          <div className="card">
            <p className="font-semibold">{snapshot.branchName}</p>
            {snapshot.branchAddress && (
              <div className="flex items-start gap-2 mt-2 text-sm text-muted">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <span>{snapshot.branchAddress}</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProviderBookingDetailsPage;
