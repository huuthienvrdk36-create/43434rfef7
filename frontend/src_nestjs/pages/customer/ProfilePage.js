// Profile Page with Provider Switch
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/context/AuthContext';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { 
  User, 
  Car, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Building2,
  Heart
} from 'lucide-react';

const menuItems = [
  { icon: Car, label: 'Мои авто', path: '/vehicles', description: 'Управление гаражом' },
  { icon: Heart, label: 'Избранное', path: '/favorites', description: 'Сохранённые СТО' },
  { icon: Bell, label: 'Уведомления', path: '/notifications', description: 'История уведомлений' },
  { icon: Settings, label: 'Настройки', path: '/settings', description: 'Параметры приложения' },
  { icon: HelpCircle, label: 'Помощь', path: '/help', description: 'Поддержка и FAQ' },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logout();
      navigate('/auth/login');
    }
  };

  const handleSwitchToProvider = () => {
    navigate('/provider/dashboard');
  };

  const getInitials = () => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Check if user can be a provider (has provider role)
  const canBeProvider = ['provider_owner', 'provider_manager', 'provider_staff', 'admin'].includes(user?.role);

  return (
    <MobileShell>
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
              {user?.phone && (
                <p className="text-sm text-muted">{user?.phone}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Switch to Provider Mode */}
      {canBeProvider && (
        <section className="section" style={{ paddingTop: 0 }}>
          <button
            className="card card-interactive flex items-center gap-4 w-full"
            onClick={handleSwitchToProvider}
            data-testid="switch-to-provider"
            style={{ 
              background: 'hsla(var(--primary), 0.1)',
              borderColor: 'hsl(var(--primary))'
            }}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(var(--primary))' }}
            >
              <Building2 size={20} style={{ color: 'hsl(var(--primary-foreground))' }} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-primary">Режим провайдера</p>
              <p className="text-xs text-muted">Управляйте заявками и заказами</p>
            </div>
            <ChevronRight size={20} className="text-primary" />
          </button>
        </section>
      )}

      {/* Menu Items */}
      <section className="section">
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className="card card-interactive flex items-center gap-4"
              onClick={() => navigate(item.path)}
              data-testid={`menu-${item.path.replace('/', '')}`}
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
          data-testid="logout-button"
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

      {/* App Version */}
      <div className="text-center text-xs text-muted py-4">
        Авто Платформа v1.0.0
      </div>
    </MobileShell>
  );
}

export default ProfilePage;
