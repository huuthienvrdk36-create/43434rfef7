// Vehicle Details Page
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { vehiclesAPI, bookingsAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import BookingCard from '../../components/cards/BookingCard';
import { LoadingSpinner, LoadingOverlay } from '../../components/layout/LoadingStates';
import { 
  Car, 
  Plus, 
  Calendar, 
  Gauge, 
  History, 
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';

export function VehicleDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('created') === 'true';

  const [vehicle, setVehicle] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleRes, bookingsRes] = await Promise.all([
          vehiclesAPI.getById(id),
          bookingsAPI.getMy({ vehicleId: id }),
        ]);
        setVehicle(vehicleRes.data);
        setBookings(bookingsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch vehicle:', error);
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Удалить этот автомобиль?')) return;

    setDeleting(true);
    try {
      await vehiclesAPI.delete(id);
      navigate('/vehicles');
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      alert('Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateQuote = () => {
    navigate(`/quotes/create?vehicleId=${id}`);
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!vehicle) {
    return null;
  }

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const activeBookings = bookings.filter((b) => !['completed', 'cancelled', 'no_show'].includes(b.status));

  return (
    <MobileShell>
      <TopBar title={`${vehicle.brand} ${vehicle.model}`} showBack />

      {/* Success Toast */}
      {isNew && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div
            className="card flex items-center gap-3"
            style={{ background: 'hsla(142, 76%, 36%, 0.1)', borderColor: 'hsl(142, 76%, 36%)' }}
          >
            <CheckCircle size={24} style={{ color: 'hsl(142, 76%, 36%)' }} />
            <p className="font-medium" style={{ color: 'hsl(142, 76%, 36%)' }}>
              Автомобиль успешно добавлен!
            </p>
          </div>
        </section>
      )}

      {/* Vehicle Info */}
      <section className="section">
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(var(--primary))', color: 'white' }}
            >
              <Car size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {vehicle.brand} {vehicle.model}
              </h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-muted flex items-center gap-1">
                  <Calendar size={14} />
                  {vehicle.year}
                </span>
                {vehicle.mileage > 0 && (
                  <span className="text-sm text-muted flex items-center gap-1">
                    <Gauge size={14} />
                    {vehicle.mileage.toLocaleString()} км
                  </span>
                )}
              </div>
            </div>
          </div>

          {vehicle.licensePlate && (
            <div className="border-t pt-3" style={{ borderColor: 'hsl(var(--border))' }}>
              <p className="text-sm text-muted">Гос. номер</p>
              <p className="font-medium">{vehicle.licensePlate}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              className="btn btn-secondary flex-1"
              onClick={() => navigate(`/vehicles/${id}/edit`)}
            >
              <Edit size={18} />
              Редактировать
            </button>
            <button
              className="btn flex-1"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: 'hsla(var(--destructive), 0.1)',
                color: 'hsl(var(--destructive))',
                border: '1px solid hsl(var(--destructive))',
              }}
            >
              <Trash2 size={18} />
              {deleting ? 'Удаление...' : 'Удалить'}
            </button>
          </div>
        </div>
      </section>

      {/* Quick Action - Create Quote */}
      <section className="section" style={{ paddingTop: 0 }}>
        <button
          className="btn btn-primary w-full"
          onClick={handleCreateQuote}
          data-testid="create-quote-from-vehicle"
        >
          <Plus size={20} />
          Создать заявку для этого авто
        </button>
      </section>

      {/* Active Bookings */}
      {activeBookings.length > 0 && (
        <section className="section">
          <h3 className="section-title">Активные заказы</h3>
          <div className="flex flex-col gap-3">
            {activeBookings.map((booking) => (
              <BookingCard key={booking._id || booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      {/* Service History */}
      <section className="section">
        <h3 className="section-title flex items-center gap-2">
          <History size={18} />
          История обслуживания
        </h3>

        {completedBookings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {completedBookings.map((booking) => (
              <BookingCard key={booking._id || booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <History size={48} className="mx-auto mb-3" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <p className="text-muted">Пока нет завершённых заказов</p>
            <p className="text-sm text-muted mt-1">
              История обслуживания появится здесь после первого заказа
            </p>
          </div>
        )}
      </section>
    </MobileShell>
  );
}

export default VehicleDetailsPage;
