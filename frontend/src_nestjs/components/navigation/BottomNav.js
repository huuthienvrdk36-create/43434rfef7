// Bottom Navigation - нижнее меню (Customer + Provider modes)
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Wrench, 
  Store, 
  ClipboardList, 
  User, 
  Plus,
  LayoutDashboard,
  FileText
} from 'lucide-react';
import { useNotifications } from '../../lib/context/NotificationsContext';

// Customer navigation items
const customerNavItems = [
  { path: '/services', icon: Wrench, label: 'Сервисы' },
  { path: '/market', icon: Store, label: 'Маркет' },
  { path: '/orders', icon: ClipboardList, label: 'Заказы' },
  { path: '/profile', icon: User, label: 'Профиль' },
];

// Provider navigation items
const providerNavItems = [
  { path: '/provider/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { path: '/provider/quotes', icon: FileText, label: 'Заявки' },
  { path: '/provider/bookings', icon: ClipboardList, label: 'Заказы' },
  { path: '/provider/profile', icon: User, label: 'Профиль' },
];

export function BottomNav({ onCreateClick, isProvider = false }) {
  const { unreadCount } = useNotifications();
  const location = useLocation();
  
  const navItems = isProvider ? providerNavItems : customerNavItems;
  
  // Determine FAB action based on mode
  const handleFabClick = () => {
    if (onCreateClick) {
      onCreateClick();
    }
  };

  // Split items for FAB in the middle
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  return (
    <nav className="bottom-nav" data-testid="bottom-nav">
      {leftItems.map((item) => (
        <NavLink 
          key={item.path}
          to={item.path} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          data-testid={`nav-${item.path.replace('/', '').replace('/', '-')}`}
        >
          <item.icon />
          <span>{item.label}</span>
        </NavLink>
      ))}

      <div className="fab-container">
        <button 
          className="fab" 
          onClick={handleFabClick}
          data-testid="fab-create"
          aria-label={isProvider ? "Быстрое действие" : "Создать заявку"}
        >
          <Plus />
        </button>
      </div>

      {rightItems.map((item) => (
        <NavLink 
          key={item.path}
          to={item.path} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          data-testid={`nav-${item.path.replace('/', '').replace('/', '-')}`}
        >
          <item.icon />
          <span>{item.label}</span>
          {item.path.includes('orders') && unreadCount > 0 && (
            <span className="notification-badge" data-testid="orders-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
