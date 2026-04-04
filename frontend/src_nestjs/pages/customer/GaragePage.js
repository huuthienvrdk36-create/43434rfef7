// Garage Page - Мои авто
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehiclesAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { LoadingSpinner } from '../../components/layout/LoadingStates';
import { Car, Plus, ChevronRight, Calendar, Gauge } from 'lucide-react';

export function GaragePage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await vehiclesAPI.getMy();
        setVehicles(response.data || []);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <MobileShell>
      <TopBar title="Мои авто" showBack />

      {/* Header with Add Button */}
      <section className="section">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Гараж</h2>
            <p className="text-sm text-muted">Управляйте своими автомобилями</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/vehicles/add')}
            data-testid="add-vehicle-button"
            style={{ width: 'auto', padding: '0.75rem 1rem' }}
          >
            <Plus size={20} />
            Добавить
          </button>
        </div>
      </section>

      {/* Vehicles List */}
      <section className="section" style={{ paddingTop: 0 }}>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : vehicles.length > 0 ? (
          <div className="flex flex-col gap-3">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle._id || vehicle.id}
                className="card card-interactive"
                onClick={() => navigate(`/vehicles/${vehicle._id || vehicle.id}`)}
                data-testid={`vehicle-${vehicle._id || vehicle.id}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: 'hsl(var(--secondary))' }}
                  >
                    <Car size={28} className="text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-lg">
                      {vehicle.brand} {vehicle.model}
                    </p>
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
                    {vehicle.licensePlate && (
                      <p className="text-xs text-muted mt-1">
                        {vehicle.licensePlate}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-muted" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Car size={64} className="mx-auto mb-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <h3 className="font-bold text-lg mb-2">Нет автомобилей</h3>
            <p className="text-muted mb-6">
              Добавьте свой первый автомобиль для ведения истории обслуживания
            </p>
            <button
              className="btn btn-primary mx-auto"
              onClick={() => navigate('/vehicles/add')}
              style={{ width: 'auto', padding: '0.75rem 2rem' }}
            >
              <Plus size={20} />
              Добавить авто
            </button>
          </div>
        )}
      </section>
    </MobileShell>
  );
}

export default GaragePage;
