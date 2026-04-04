// Register Page
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/context/AuthContext';
import { Car, Eye, EyeOff } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      // Auto login after registration
      await login(formData.email, formData.password);
      navigate('/services');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-shell" style={{ padding: '2rem 1rem' }}>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Car size={32} className="text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Регистрация</h1>
        <p className="text-muted">Создайте аккаунт</p>
      </div>

      <form onSubmit={handleSubmit} data-testid="register-form">
        {error && (
          <div className="card mb-4" style={{ background: 'hsla(var(--destructive), 0.1)', borderColor: 'hsl(var(--destructive))' }}>
            <p className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Имя</label>
            <input
              type="text"
              name="firstName"
              className="input-field"
              placeholder="Иван"
              value={formData.firstName}
              onChange={handleChange}
              required
              data-testid="register-firstName"
            />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Фамилия</label>
            <input
              type="text"
              name="lastName"
              className="input-field"
              placeholder="Иванов"
              value={formData.lastName}
              onChange={handleChange}
              required
              data-testid="register-lastName"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            type="email"
            name="email"
            className="input-field"
            placeholder="example@mail.com"
            value={formData.email}
            onChange={handleChange}
            required
            data-testid="register-email"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Телефон</label>
          <input
            type="tel"
            name="phone"
            className="input-field"
            placeholder="+7 (999) 123-45-67"
            value={formData.phone}
            onChange={handleChange}
            data-testid="register-phone"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Пароль</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="input-field"
              placeholder="Минимум 8 символов"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              data-testid="register-password"
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'hsl(var(--muted-foreground))',
                cursor: 'pointer',
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary mt-4"
          disabled={loading}
          data-testid="register-submit"
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <p className="text-center text-sm text-muted mt-4">
          Уже есть аккаунт?{' '}
          <Link to="/auth/login" className="text-primary font-medium">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
