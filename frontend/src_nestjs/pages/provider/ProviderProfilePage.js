// Provider Profile Page
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/context/AuthContext';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { 
  Building2, 
  MapPin, 
  Settings, 
  LogOut,
  ChevronRight,
  User
} from 'lucide-react';

const menuItems = [
  { icon: Building2, label: 'Мои организации', path: '/provider/organizations', description: 'Управление компаниями' },
  { icon: MapPin, label: 'Филиалы', path: '/provider/branches', description: 'Адреса и расписание' },
  { icon: Settings, label: 'Настройки', path: '/provider/settings', description: 'Параметры кабинета' },
];

export function ProviderProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logout();
      navigate('/auth/login');
    }
  };

  const handleSwitchToCustomer = () => {
    navigate('/services');
  };

  const getInitials = () => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'P';
  };

  return (
    <MobileShell isProvider>
      <TopBar title="Профиль" showBack={false} showNotifications={false} />

      {/* User Card */}
      <section className="section">
        <div className="card">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ 
                background: 'hsl(var(--primary))', 
                color: 'hsl(var(--primary-foreground))' 
              }}
            >
              {getInitials()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-muted">{user?.email}</p>
              <p className="text-xs text-primary mt-1">Режим провайдера</p>
            </div>
          </div>
        </div>
      </section>

      {/* Switch to Customer */}
      <section className="section" style={{ paddingTop: 0 }}>
        <button
          className="card card-interactive flex items-center gap-4 w-full"
          onClick={handleSwitchToCustomer}
          data-testid="switch-to-customer"
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'hsla(var(--primary), 0.1)' }}
          >
            <User size={20} className="text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Режим клиента</p>
            <p className="text-xs text-muted">Переключиться на клиентский интерфейс</p>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </button>
      </section>

      {/* Menu Items */}
      <section className="section">
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className="card card-interactive flex items-center gap-4"
              onClick={() => navigate(item.path)}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'hsl(var(--secondary))' }}
              >
                <item.icon size={20} className="text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted">{item.description}</p>
              </div>
              <ChevronRight size={20} className="text-muted" />
            </button>
          ))}
        </div>
      </section>

      {/* Logout */}
      <section className="section">
        <button
          className="card card-interactive flex items-center gap-4 w-full"
          onClick={handleLogout}
          data-testid="provider-logout"
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'hsla(var(--destructive), 0.1)' }}
          >
            <LogOut size={20} style={{ color: 'hsl(var(--destructive))' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium" style={{ color: 'hsl(var(--destructive))' }}>
              Выйти
            </p>
            <p className="text-xs text-muted">Выход из аккаунта</p>
          </div>
        </button>
      </section>
    </MobileShell>
  );
}

export default ProviderProfilePage;
