// Create Quote Page - создание заявки с поддержкой Vehicle
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { quotesAPI, geoAPI, servicesAPI, vehiclesAPI } from '../../lib/api/client';
import TopBar from '../../components/navigation/TopBar';
import { LoadingOverlay, LoadingSpinner } from '../../components/layout/LoadingStates';
import { CheckCircle, MapPin, FileText, ChevronRight, Car } from 'lucide-react';

const steps = [
  { id: 'vehicle', title: 'Выберите авто', icon: Car },
  { id: 'problem', title: 'Опишите проблему', icon: FileText },
  { id: 'city', title: 'Выберите город', icon: MapPin },
  { id: 'confirm', title: 'Подтверждение', icon: CheckCircle },
];

export function CreateQuotePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicleId');
  
  const [step, setStep] = useState(preselectedVehicleId ? 1 : 0); // Skip vehicle step if preselected
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    description: '',
    city: '',
    serviceId: searchParams.get('service') || '',
    categoryId: searchParams.get('category') || '',
    vehicleId: preselectedVehicleId || '',
  });

  const [vehicles, setVehicles] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [citiesRes, categoriesRes, vehiclesRes] = await Promise.all([
          geoAPI.getCities({}),
          servicesAPI.getCategories(),
          vehiclesAPI.getMy(),
        ]);
        setCities(citiesRes.data || []);
        setCategories(categoriesRes.data || []);
        setVehicles(vehiclesRes.data || []);

        // If vehicle is preselected, find it
        if (preselectedVehicleId) {
          const found = (vehiclesRes.data || []).find(
            v => (v._id || v.id) === preselectedVehicleId
          );
          if (found) {
            setSelectedVehicle(found);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [preselectedVehicleId]);

  const handleSelectVehicle = (vehicle) => {
    setFormData({ ...formData, vehicleId: vehicle._id || vehicle.id });
    setSelectedVehicle(vehicle);
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        description: formData.description,
        city: formData.city || cities[0]?.name || 'Москва',
      };
      
      if (formData.vehicleId) {
        payload.vehicleId = formData.vehicleId;
      }
      if (formData.serviceId) {
        payload.serviceId = formData.serviceId;
      }

      const response = await quotesAPI.create(payload);
      
      const quoteId = response.data._id || response.data.id;
      navigate(`/quotes/${quoteId}?created=true`);
    } catch (error) {
      console.error('Failed to create quote:', error);
      alert(error.response?.data?.message || 'Ошибка создания заявки');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return true; // Vehicle is optional
    if (step === 1) return formData.description.trim().length >= 10;
    if (step === 2) return formData.city;
    return true;
  };

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  // Adjust steps display if vehicle was preselected
  const displaySteps = preselectedVehicleId ? steps.slice(1) : steps;
  const displayStep = preselectedVehicleId ? step - 1 : step;

  return (
    <div className="mobile-shell">
      <TopBar title="Новая заявка" showBack showNotifications={false} />

      {/* Progress */}
      <div className="section">
        <div className="flex gap-2">
          {displaySteps.map((s, i) => (
            <div 
              key={s.id}
              className="flex-1 h-1 rounded-full"
              style={{ 
                background: i <= displayStep 
                  ? 'hsl(var(--primary))' 
                  : 'hsl(var(--border))'
              }}
            />
          ))}
        </div>
        <p className="text-sm text-muted mt-2">
          Шаг {displayStep + 1} из {displaySteps.length}: {displaySteps[displayStep]?.title}
        </p>
      </div>

      {/* Step Content */}
      <div className="section" style={{ flex: 1 }}>
        {/* Step 0: Vehicle Selection (only if no preselection) */}
        {step === 0 && !preselectedVehicleId && (
          <div>
            <h2 className="text-xl font-bold mb-4">Выберите автомобиль</h2>
            <p className="text-muted mb-4">
              Привяжите заявку к вашему авто для истории обслуживания
            </p>

            {vehicles.length > 0 ? (
              <div className="flex flex-col gap-2">
                {/* Option to skip */}
                <button
                  className={`card card-interactive flex items-center gap-3 ${
                    !formData.vehicleId ? 'border-primary' : ''
                  }`}
                  onClick={() => {
                    setFormData({ ...formData, vehicleId: '' });
                    setSelectedVehicle(null);
                  }}
                  style={{ 
                    borderColor: !formData.vehicleId 
                      ? 'hsl(var(--primary))' 
                      : undefined 
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary">
                    <Car size={20} className="text-muted" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Без привязки к авто</p>
                    <p className="text-sm text-muted">Указать авто позже</p>
                  </div>
                  {!formData.vehicleId && (
                    <CheckCircle size={20} className="text-primary" />
                  )}
                </button>

                {/* Vehicle list */}
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle._id || vehicle.id}
                    className={`card card-interactive flex items-center gap-3 ${
                      formData.vehicleId === (vehicle._id || vehicle.id) ? 'border-primary' : ''
                    }`}
                    onClick={() => handleSelectVehicle(vehicle)}
                    style={{ 
                      borderColor: formData.vehicleId === (vehicle._id || vehicle.id)
                        ? 'hsl(var(--primary))' 
                        : undefined 
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'hsl(var(--primary))' }}
                    >
                      <Car size={20} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-sm text-muted">{vehicle.year}</p>
                    </div>
                    {formData.vehicleId === (vehicle._id || vehicle.id) && (
                      <CheckCircle size={20} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="card text-center py-6">
                <Car size={48} className="mx-auto mb-3 text-muted" />
                <p className="text-muted mb-3">У вас пока нет автомобилей</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/vehicles/add')}
                  style={{ width: 'auto', margin: '0 auto' }}
                >
                  Добавить авто
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Problem Description */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Опишите проблему</h2>
            
            {/* Show selected vehicle */}
            {selectedVehicle && (
              <div className="card mb-4 flex items-center gap-3" style={{ background: 'hsla(var(--primary), 0.1)' }}>
                <Car size={20} className="text-primary" />
                <span className="font-medium">{selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})</span>
              </div>
            )}

            <p className="text-muted mb-4">
              Чем подробнее вы опишете проблему, тем точнее будут ответы от сервисов
            </p>
            <textarea
              className="input-field"
              placeholder="Например: Стук в передней подвеске при проезде неровностей..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              data-testid="quote-description"
              style={{ resize: 'none' }}
            />
            <p className="text-xs text-muted mt-2">
              Минимум 10 символов ({formData.description.length}/10)
            </p>

            {/* Quick category selection */}
            {categories.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Или выберите категорию:</p>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <button
                      key={cat._id || cat.id}
                      className={`btn ${formData.categoryId === (cat._id || cat.id) ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ width: 'auto', padding: '0.5rem 1rem' }}
                      onClick={() => {
                        setFormData({ 
                          ...formData, 
                          categoryId: cat._id || cat.id,
                          description: formData.description || cat.name,
                        });
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: City Selection */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Выберите город</h2>
            <p className="text-muted mb-4">
              Мы покажем сервисы в вашем городе
            </p>
            <div className="flex flex-col gap-2">
              {cities.map((city) => (
                <button
                  key={city._id || city.id}
                  className={`card card-interactive flex items-center justify-between ${
                    formData.city === city.name ? 'border-primary' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, city: city.name })}
                  data-testid={`city-${city._id || city.id}`}
                  style={{ 
                    borderColor: formData.city === city.name 
                      ? 'hsl(var(--primary))' 
                      : undefined 
                  }}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className={formData.city === city.name ? 'text-primary' : 'text-muted'} />
                    <span className="font-medium">{city.name}</span>
                  </div>
                  {formData.city === city.name && (
                    <CheckCircle size={20} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Проверьте заявку</h2>
            
            {selectedVehicle && (
              <div className="card mb-4">
                <p className="text-sm text-muted mb-1">Автомобиль:</p>
                <p className="font-medium">{selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})</p>
              </div>
            )}

            <div className="card mb-4">
              <p className="text-sm text-muted mb-1">Описание:</p>
              <p className="font-medium">{formData.description}</p>
            </div>

            <div className="card mb-4">
              <p className="text-sm text-muted mb-1">Город:</p>
              <p className="font-medium">{formData.city || 'Не выбран'}</p>
            </div>

            <div className="card" style={{ background: 'hsla(var(--primary), 0.1)' }}>
              <p className="text-sm">
                После отправки заявки сервисы в вашем городе смогут предложить свои услуги. 
                Вы получите уведомления о новых ответах.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="section" style={{ 
        position: 'sticky', 
        bottom: 0, 
        background: 'hsl(var(--background))',
        borderTop: '1px solid hsl(var(--border))',
        paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))'
      }}>
        <div className="flex gap-3">
          <button 
            className="btn btn-secondary" 
            onClick={prevStep}
            style={{ flex: 1 }}
          >
            {step === 0 ? 'Отмена' : 'Назад'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={nextStep}
            disabled={!canProceed() || submitting}
            style={{ flex: 2 }}
            data-testid="quote-next-step"
          >
            {submitting ? 'Отправка...' : step === steps.length - 1 ? 'Отправить заявку' : 'Далее'}
            {!submitting && step < steps.length - 1 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateQuotePage;
