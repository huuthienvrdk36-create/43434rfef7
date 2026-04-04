// Provider Dashboard - главный экран провайдера
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotesAPI, bookingsAPI, organizationsAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { LoadingSpinner } from '../../components/layout/LoadingStates';
import { 
  FileText, 
  ClipboardList, 
  TrendingUp,
  ChevronRight,
  Bell,
  Plus
} from 'lucide-react';

export function ProviderDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newQuotes: 0,
    activeBookings: 0,
    todayBookings: 0,
  });
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quotesRes, bookingsRes, orgsRes] = await Promise.all([
          quotesAPI.getIncoming(),
          bookingsAPI.getIncoming(),
          organizationsAPI.getMy(),
        ]);

        const quotes = quotesRes.data || [];
        const bookings = bookingsRes.data || [];
        const orgs = orgsRes.data || [];

        // Filter new quotes (pending status)
        const newQuotes = quotes.filter(q => q.status === 'pending');
        setRecentQuotes(newQuotes.slice(0, 3));

        // Filter active bookings
        const active = bookings.filter(b => 
          !['completed', 'cancelled', 'no_show'].includes(b.status)
        );
        setActiveBookings(active.slice(0, 3));

        // Today's bookings
        const today = new Date().toDateString();
        const todayBookings = bookings.filter(b => 
          b.scheduledAt && new Date(b.scheduledAt).toDateString() === today
        );

        setStats({
          newQuotes: newQuotes.length,
          activeBookings: active.length,
          todayBookings: todayBookings.length,
        });

        if (orgs.length > 0) {
          setOrganization(orgs[0]);
        }
      } catch (error) {
        console.error('Failed to fetch provider data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <MobileShell isProvider>
        <TopBar title="Дашборд" showBack={false} />
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell isProvider>
      <TopBar title="Дашборд" showBack={false} />

      {/* Stats Cards */}
      <section className="section">
        <div className="flex gap-3">
          <div 
            className="card flex-1 cursor-pointer"
            onClick={() => navigate('/provider/quotes')}
            style={{ background: stats.newQuotes > 0 ? 'hsla(var(--primary), 0.1)' : undefined }}
          >
            <FileText size={24} className="text-primary mb-2" />
            <p className="text-2xl font-bold">{stats.newQuotes}</p>
            <p className="text-xs text-muted">Новых заявок</p>
          </div>
          <div 
            className="card flex-1 cursor-pointer"
            onClick={() => navigate('/provider/bookings')}
          >
            <ClipboardList size={24} className="text-primary mb-2" />
            <p className="text-2xl font-bold">{stats.activeBookings}</p>
            <p className="text-xs text-muted">Активных заказов</p>
          </div>
          <div className="card flex-1">
            <TrendingUp size={24} className="text-primary mb-2" />
            <p className="text-2xl font-bold">{stats.todayBookings}</p>
            <p className="text-xs text-muted">Сегодня</p>
          </div>
        </div>
      </section>

      {/* Organization Info */}
      {organization && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="card">
            <p className="text-sm text-muted">Ваша организация</p>
            <p className="font-bold text-lg">{organization.name}</p>
          </div>
        </section>
      )}

      {/* New Quotes */}
      <section className="section">
        <div className="flex justify-between items-center mb-3">
          <h3 className="section-title" style={{ marginBottom: 0 }}>
            {stats.newQuotes > 0 ? (
              <span className="flex items-center gap-2">
                <Bell size={16} className="text-primary" />
                Новые заявки
              </span>
            ) : 'Входящие заявки'}
          </h3>
          <button 
            className="btn-ghost text-sm text-primary flex items-center gap-1"
            onClick={() => navigate('/provider/quotes')}
          >
            Все <ChevronRight size={16} />
          </button>
        </div>

        {recentQuotes.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentQuotes.map((quote) => (
              <div 
                key={quote._id || quote.id}
                className="card card-interactive"
                onClick={() => navigate(`/provider/quotes/${quote._id || quote.id}`)}
              >
                <p className="font-medium truncate">{quote.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted">{quote.city}</span>
                  <span className="text-xs text-muted">{formatDate(quote.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-6">
            <p className="text-muted">Нет новых заявок</p>
          </div>
        )}
      </section>

      {/* Active Bookings */}
      <section className="section">
        <div className="flex justify-between items-center mb-3">
          <h3 className="section-title" style={{ marginBottom: 0 }}>Активные заказы</h3>
          <button 
            className="btn-ghost text-sm text-primary flex items-center gap-1"
            onClick={() => navigate('/provider/bookings')}
          >
            Все <ChevronRight size={16} />
          </button>
        </div>

        {activeBookings.length > 0 ? (
          <div className="flex flex-col gap-2">
            {activeBookings.map((booking) => (
              <div 
                key={booking._id || booking.id}
                className="card card-interactive"
                onClick={() => navigate(`/provider/bookings/${booking._id || booking.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{booking.snapshot?.serviceName || 'Услуга'}</p>
                    <p className="text-sm text-muted">{booking.snapshot?.customerName || 'Клиент'}</p>
                  </div>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status === 'pending' && 'Ожидание'}
                    {booking.status === 'confirmed' && 'Подтверждён'}
                    {booking.status === 'in_progress' && 'В работе'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-6">
            <p className="text-muted">Нет активных заказов</p>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="section">
        <h3 className="section-title">Быстрые действия</h3>
        <div className="flex gap-3">
          <button 
            className="card flex-1 text-center py-4"
            onClick={() => navigate('/provider/services')}
          >
            <Plus size={24} className="mx-auto mb-2 text-primary" />
            <span className="text-sm">Добавить услугу</span>
          </button>
          <button 
            className="card flex-1 text-center py-4"
            onClick={() => navigate('/provider/profile')}
          >
            <TrendingUp size={24} className="mx-auto mb-2 text-primary" />
            <span className="text-sm">Настройки</span>
          </button>
        </div>
      </section>
    </MobileShell>
  );
}

export default ProviderDashboard;
