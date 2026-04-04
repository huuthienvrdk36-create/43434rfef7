// Orders Page - список бронирований
import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import BookingCard from '../../components/cards/BookingCard';
import { LoadingSpinner, EmptyState } from '../../components/layout/LoadingStates';
import { ClipboardList } from 'lucide-react';

export function OrdersPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active'); // active, history

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingsAPI.getMy();
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

  return (
    <MobileShell>
      <TopBar title="Заказы" showBack={false} />

      {/* Tabs */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="flex gap-2">
          <button
            className={`btn ${tab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setTab('active')}
            data-testid="tab-active"
          >
            Активные ({activeBookings.length})
          </button>
          <button
            className={`btn ${tab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setTab('history')}
            data-testid="tab-history"
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
              <BookingCard key={booking._id || booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title={tab === 'active' ? "Нет активных заказов" : "История пуста"}
            description={
              tab === 'active'
                ? "Когда вы примете предложение, здесь появится ваш заказ"
                : "Завершённые заказы будут отображаться здесь"
            }
          />
        )}
      </section>
    </MobileShell>
  );
}

export default OrdersPage;
