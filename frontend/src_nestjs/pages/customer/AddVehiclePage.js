// Add Vehicle Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehiclesAPI } from '../../lib/api/client';
import TopBar from '../../components/navigation/TopBar';
import { Car, Check } from 'lucide-react';

// Popular car brands for quick selection
const popularBrands = [
  'Toyota', 'Honda', 'Volkswagen', 'BMW', 'Mercedes-Benz',
  'Audi', 'Ford', 'Hyundai', 'Kia', 'Mazda',
  'Nissan', 'Chevrolet', 'Skoda', 'Renault', 'Lada'
];

// Generate years from current year to 1980
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i);

export function AddVehiclePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: currentYear,
    licensePlate: '',
    mileage: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.brand.trim()) {
      setError('Укажите марку автомобиля');
      return;
    }
    if (!formData.model.trim()) {
      setError('Укажите модель автомобиля');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await vehiclesAPI.create({
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: formData.year,
        licensePlate: formData.licensePlate.trim() || '',
        mileage: formData.mileage ? parseInt(formData.mileage, 10) : 0,
      });

      const vehicleId = response.data._id || response.data.id;
      navigate(`/vehicles/${vehicleId}?created=true`);
    } catch (err) {
      console.error('Failed to create vehicle:', err);
      setError(err.response?.data?.message || 'Ошибка добавления автомобиля');
    } finally {
      setSubmitting(false);
    }
  };

  const selectBrand = (brand) => {
    setFormData({ ...formData, brand });
  };

  const canSubmit = formData.brand.trim() && formData.model.trim() && formData.year;

  return (
    <div className="mobile-shell">
      <TopBar title="Добавить авто" showBack showNotifications={false} />

      <form onSubmit={handleSubmit}>
        {/* Brand Selection */}
        <section className="section">
          <h3 className="section-title">Марка</h3>
          <input
            type="text"
            className="input-field mb-3"
            placeholder="Введите марку..."
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            data-testid="vehicle-brand-input"
          />
          <div className="flex flex-wrap gap-2">
            {popularBrands.map((brand) => (
              <button
                key={brand}
                type="button"
                className={`btn ${formData.brand === brand ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => selectBrand(brand)}
                style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {formData.brand === brand && <Check size={16} />}
                {brand}
              </button>
            ))}
          </div>
        </section>

        {/* Model */}
        <section className="section" style={{ paddingTop: 0 }}>
          <h3 className="section-title">Модель</h3>
          <input
            type="text"
            className="input-field"
            placeholder="Например: Camry, Civic, Golf..."
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            data-testid="vehicle-model-input"
          />
        </section>

        {/* Year */}
        <section className="section" style={{ paddingTop: 0 }}>
          <h3 className="section-title">Год выпуска</h3>
          <select
            className="input-field"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) })}
            data-testid="vehicle-year-select"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </section>

        {/* Optional Fields */}
        <section className="section" style={{ paddingTop: 0 }}>
          <h3 className="section-title">Дополнительно (необязательно)</h3>
          
          <div className="mb-3">
            <label className="text-sm text-muted mb-1 block">Гос. номер</label>
            <input
              type="text"
              className="input-field"
              placeholder="А123БВ777"
              value={formData.licensePlate}
              onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
              data-testid="vehicle-plate-input"
            />
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Пробег (км)</label>
            <input
              type="number"
              className="input-field"
              placeholder="100000"
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              data-testid="vehicle-mileage-input"
            />
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="card" style={{ background: 'hsla(var(--destructive), 0.1)', borderColor: 'hsl(var(--destructive))' }}>
              <p className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>{error}</p>
            </div>
          </section>
        )}

        {/* Submit Button */}
        <section
          className="section"
          style={{
            position: 'sticky',
            bottom: 0,
            background: 'hsl(var(--background))',
            borderTop: '1px solid hsl(var(--border))',
            paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
          }}
        >
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!canSubmit || submitting}
            data-testid="save-vehicle-button"
          >
            <Car size={20} />
            {submitting ? 'Сохранение...' : 'Добавить автомобиль'}
          </button>
        </section>
      </form>
    </div>
  );
}

export default AddVehiclePage;
