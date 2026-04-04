// Login Page
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/context/AuthContext';
import { Car, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/services');
    } catch (err) {
      setError(err.response?.data?.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-shell" style={{ justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Car size={32} className="text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Авто Платформа</h1>
        <p className="text-muted">Войдите в аккаунт</p>
      </div>

      <form onSubmit={handleSubmit} data-testid="login-form">
        {error && (
          <div className="card mb-4" style={{ background: 'hsla(var(--destructive), 0.1)', borderColor: 'hsl(var(--destructive))' }}>
            <p className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>{error}</p>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="login-email"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Пароль</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="login-password"
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
          data-testid="login-submit"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <p className="text-center text-sm text-muted mt-4">
          Нет аккаунта?{' '}
          <Link to="/auth/register" className="text-primary font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </form>

      {/* Quick login hint for development */}
      <div className="mt-8 p-4 card" style={{ opacity: 0.7 }}>
        <p className="text-xs text-muted text-center mb-2">Тестовые данные:</p>
        <p className="text-xs text-center">customer@test.com / Customer123!</p>
      </div>
    </div>
  );
}

export default LoginPage;
