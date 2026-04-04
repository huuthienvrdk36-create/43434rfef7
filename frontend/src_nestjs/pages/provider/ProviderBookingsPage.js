// Provider Bookings - управление заказами
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { LoadingSpinner, EmptyState } from '../../components/layout/LoadingStates';
import StatusBadge from '../../components/cards/StatusBadge';
import { ClipboardList, User, Calendar, ChevronRight } from 'lucide-react';

export function ProviderBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active'); // active, history

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingsAPI.getIncoming();
        setBookings(response.data || []);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const activeBookings = bookings.filter(
    b => !['completed', 'cancelled', 'no_show'].includes(b.status)
  );
  const historyBookings = bookings.filter(
    b => ['completed', 'cancelled', 'no_show'].includes(b.status)
  );

  const displayedBookings = tab === 'active' ? activeBookings : historyBookings;

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
    <MobileShell isProvider>
      <TopBar title="Заказы" showBack={false} />

      {/* Tabs */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="flex gap-2">
          <button
            className={`btn ${tab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setTab('active')}
          >
            Активные ({activeBookings.length})
          </button>
          <button
            className={`btn ${tab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setTab('history')}
          >
            История ({historyBookings.length})
          </button>
        </div>
      </div>

      {/* List */}
      <section className="section">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : displayedBookings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {displayedBookings.map((booking) => (
              <div 
                key={booking._id || booking.id}
                className="card card-interactive"
                onClick={() => navigate(`/provider/bookings/${booking._id || booking.id}`)}
                data-testid={`provider-booking-${booking._id || booking.id}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <StatusBadge status={booking.status} />
                  <ChevronRight size={20} className="text-muted" />
                </div>

                <p className="font-semibold mb-1">
                  {booking.snapshot?.serviceName || 'Услуга'}
                </p>
                
                <p className="text-lg font-bold text-primary mb-2">
                  {booking.snapshot?.price ? `${booking.snapshot.price.toLocaleString()} ₽` : '—'}
                </p>

                <div className="flex flex-col gap-1 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{booking.snapshot?.customerName || 'Клиент'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{formatDate(booking.scheduledAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title={tab === 'active' ? "Нет активных заказов" : "История пуста"}
            description={
              tab === 'active'
                ? "Когда клиент примет ваше предложение, здесь появится заказ"
                : "Завершённые заказы будут отображаться здесь"
            }
          />
        )}
      </section>
    </MobileShell>
  );
}

export default ProviderBookingsPage;
