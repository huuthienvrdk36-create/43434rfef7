// Services Home - главный экран приложения с Discovery
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/context/AuthContext';
import { bookingsAPI, quotesAPI, vehiclesAPI, favoritesAPI, discoveryAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import BookingCard from '../../components/cards/BookingCard';
import { LoadingSpinner } from '../../components/layout/LoadingStates';
import { 
  Wrench, 
  Stethoscope, 
  Zap, 
  PaintBucket, 
  CircleDot,
  Truck,
  Plus,
  Car,
  ChevronRight,
  RefreshCw,
  MapPin,
  Heart,
  Star,
  Building2,
  Map
} from 'lucide-react';

const quickActions = [
  { icon: Stethoscope, label: 'Диагностика', category: 'diagnostics' },
  { icon: Wrench, label: 'ТО', category: 'maintenance' },
  { icon: Zap, label: 'Электрика', category: 'electrical' },
  { icon: PaintBucket, label: 'Кузов', category: 'body' },
  { icon: CircleDot, label: 'Шины', category: 'tires' },
  { icon: Truck, label: 'Эвакуатор', category: 'tow' },
];

// Smart suggestions for vehicle types
const vehicleSuggestions = {
  default: [
    { service: 'ТО', description: 'Плановое обслуживание' },
    { service: 'Диагностика', description: 'Проверка систем авто' },
    { service: 'Замена масла', description: 'Регулярная процедура' },
  ],
};

export function ServicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeBookings, setActiveBookings] = useState([]);
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [nearbyBranches, setNearbyBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, quotesRes, vehiclesRes, favoritesRes, nearbyRes] = await Promise.all([
          bookingsAPI.getMy(),
          quotesAPI.getMy(),
          vehiclesAPI.getMy(),
          favoritesAPI.getMy().catch(() => ({ data: [] })),
          discoveryAPI.nearby({ city: 'Moscow', limit: 5 }).catch(() => ({ data: [] })),
        ]);
        
        const allBookings = bookingsRes.data || [];
        
        // Filter active bookings (not completed/cancelled)
        const active = allBookings.filter(
          b => !['completed', 'cancelled', 'no_show'].includes(b.status)
        );
        setActiveBookings(active.slice(0, 3));

        // Get recently completed for "repeat" feature
        const completed = allBookings
          .filter(b => b.status === 'completed')
          .slice(0, 3);
        setCompletedBookings(completed);

        // Filter pending/responded quotes
        const pending = (quotesRes.data || []).filter(
          q => ['pending', 'responded'].includes(q.status)
        );
        setPendingQuotes(pending.slice(0, 2));

        setVehicles(vehiclesRes.data || []);
        setFavorites(favoritesRes.data || []);
        setNearbyBranches(nearbyRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuickAction = (category) => {
    navigate(`/quotes/create?category=${category}`);
  };

  const handleRepeatService = (booking) => {
    // Navigate to create quote with prefilled data
    const params = new URLSearchParams();
    if (booking.vehicleId) {
      params.set('vehicleId', booking.vehicleId);
    }
    navigate(`/quotes/create?${params.toString()}`);
  };

  return (
    <MobileShell>
      <TopBar title="Сервисы" showBack={false} />

      {/* Hero Section */}
      <section className="section">
        <div className="card" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(142 76% 36%) 100%)' }}>
          <p className="text-sm" style={{ color: 'hsla(0, 0%, 100%, 0.8)' }}>
            Привет, {user?.firstName || 'пользователь'}!
          </p>
          <h2 className="text-xl font-bold text-white mt-1 mb-4">
            Что нужно вашему авто?
          </h2>
          <div className="flex gap-2">
            <button 
              className="btn flex-1" 
              style={{ background: 'white', color: 'hsl(var(--primary))' }}
              onClick={() => navigate('/quotes/create')}
              data-testid="create-quote-hero"
            >
              <Plus size={18} />
              Заявка
            </button>
            <button 
              className="btn flex-1" 
              style={{ background: 'hsla(0, 0%, 100%, 0.2)', color: 'white', border: '1px solid hsla(0, 0%, 100%, 0.3)' }}
              onClick={() => navigate('/map')}
            >
              <Map size={18} />
              Карта
            </button>
          </div>
        </div>
      </section>

      {/* My Garage Quick Access */}
      {vehicles.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="section-title" style={{ marginBottom: 0 }}>Мой гараж</h3>
            <button 
              className="btn-ghost text-sm text-primary flex items-center gap-1"
              onClick={() => navigate('/vehicles')}
            >
              Все <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ marginLeft: '-1rem', marginRight: '-1rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
            {vehicles.slice(0, 3).map((vehicle) => (
              <button
                key={vehicle._id || vehicle.id}
                className="card card-interactive flex-shrink-0"
                style={{ minWidth: '160px' }}
                onClick={() => navigate(`/vehicles/${vehicle._id || vehicle.id}`)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Car size={18} className="text-primary" />
                  <span className="font-medium text-sm truncate">{vehicle.brand}</span>
                </div>
                <p className="text-sm text-muted truncate">{vehicle.model} ({vehicle.year})</p>
              </button>
            ))}
            <button
              className="card card-interactive flex-shrink-0 flex items-center justify-center"
              style={{ minWidth: '100px', borderStyle: 'dashed' }}
              onClick={() => navigate('/vehicles/add')}
            >
              <Plus size={24} className="text-muted" />
            </button>
          </div>
        </section>
      )}

      {/* Favorites СТО */}
      {favorites.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="section-title" style={{ marginBottom: 0 }}>
              <Heart size={16} className="inline mr-2 text-red-500" />
              Избранные СТО
            </h3>
            <button 
              className="btn-ghost text-sm text-primary flex items-center gap-1"
              onClick={() => navigate('/favorites')}
            >
              Все <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ marginLeft: '-1rem', marginRight: '-1rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
            {favorites.slice(0, 4).map((fav) => (
              <button
                key={fav._id}
                className="card card-interactive flex-shrink-0"
                style={{ minWidth: '150px' }}
                onClick={() => navigate(`/organization/${fav.organizationId}`)}
              >
                <p className="font-medium text-sm truncate">{fav.snapshot?.name || 'СТО'}</p>
                {fav.snapshot?.ratingAvg > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} fill="#FFB800" color="#FFB800" />
                    <span className="text-xs">{fav.snapshot.ratingAvg}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="section">
        <h3 className="section-title">Быстрые действия</h3>
        <div className="quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.category}
              className="quick-action"
              onClick={() => handleQuickAction(action.category)}
              data-testid={`quick-action-${action.category}`}
            >
              <action.icon />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Nearby СТО */}
      {nearbyBranches.length > 0 && (
        <section className="section">
          <div className="flex justify-between items-center mb-3">
            <h3 className="section-title" style={{ marginBottom: 0 }}>
              <MapPin size={16} className="inline mr-2" />
              Рядом с вами
            </h3>
            <button 
              className="btn-ghost text-sm text-primary flex items-center gap-1"
              onClick={() => navigate('/map')}
            >
              Карта <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {nearbyBranches.slice(0, 3).map((branch) => (
              <button
                key={branch._id}
                className="card card-interactive flex items-center gap-3"
                onClick={() => navigate(`/organization/${branch.organizationId}`)}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(var(--secondary))' }}
                >
                  <Building2 size={20} className="text-primary" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-sm truncate">
                    {branch.organization?.name || branch.name}
                  </p>
                  <p className="text-xs text-muted truncate">{branch.address}</p>
                </div>
                {branch.distance !== null && (
                  <span className="text-xs text-muted">{branch.distance} км</span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Repeat Service - Персонализация */}
      {completedBookings.length > 0 && (
        <section className="section">
          <div className="flex justify-between items-center mb-3">
            <h3 className="section-title" style={{ marginBottom: 0 }}>
              <RefreshCw size={16} className="inline mr-2" />
              Повторить услугу
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ marginLeft: '-1rem', marginRight: '-1rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
            {completedBookings.map((booking) => (
              <button
                key={booking._id || booking.id}
                className="card card-interactive flex-shrink-0"
                style={{ minWidth: '180px' }}
                onClick={() => handleRepeatService(booking)}
              >
                <p className="font-medium text-sm truncate mb-1">
                  {booking.snapshot?.serviceName || 'Услуга'}
                </p>
                <p className="text-xs text-muted truncate mb-2">
                  {booking.snapshot?.orgName}
                </p>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <RefreshCw size={12} />
                  Повторить
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Pending Quotes */}
      {pendingQuotes.length > 0 && (
        <section className="section">
          <div className="flex justify-between items-center mb-3">
            <h3 className="section-title" style={{ marginBottom: 0 }}>Ваши заявки</h3>
            <button 
              className="btn-ghost text-sm text-primary flex items-center gap-1"
              onClick={() => navigate('/quotes')}
            >
              Все <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {pendingQuotes.map((quote) => (
              <div 
                key={quote._id || quote.id}
                className="card card-interactive"
                onClick={() => navigate(`/quotes/${quote._id || quote.id}`)}
              >
                <p className="font-medium truncate">{quote.description || 'Заявка'}</p>
                <p className="text-sm text-muted mt-1">
                  {quote.responsesCount || 0} ответов
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Bookings */}
      <section className="section">
        <div className="flex justify-between items-center mb-3">
          <h3 className="section-title" style={{ marginBottom: 0 }}>Активные заказы</h3>
          <button 
            className="btn-ghost text-sm text-primary flex items-center gap-1"
            onClick={() => navigate('/orders')}
          >
            Все <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : activeBookings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {activeBookings.map((booking) => (
              <BookingCard key={booking._id || booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <Car size={48} className="mx-auto mb-3" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <p className="text-muted">Нет активных заказов</p>
            <button 
              className="btn btn-secondary mt-4"
              onClick={() => navigate('/quotes/create')}
            >
              Создать заявку
            </button>
          </div>
        )}
      </section>

      {/* No vehicles prompt */}
      {!loading && vehicles.length === 0 && (
        <section className="section">
          <div className="card" style={{ background: 'hsla(var(--primary), 0.1)', borderColor: 'hsl(var(--primary))' }}>
            <div className="flex items-start gap-3">
              <Car size={24} className="text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-medium">Добавьте свой автомобиль</p>
                <p className="text-sm text-muted mt-1">
                  Ведите историю обслуживания и получайте персональные рекомендации
                </p>
                <button 
                  className="btn btn-primary mt-3"
                  onClick={() => navigate('/vehicles/add')}
                  style={{ width: 'auto', padding: '0.5rem 1rem' }}
                >
                  <Plus size={16} />
                  Добавить авто
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </MobileShell>
  );
}

export default ServicesPage;
