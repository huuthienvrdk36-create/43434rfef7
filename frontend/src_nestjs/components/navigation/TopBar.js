// Top Bar - верхняя панель
import { ChevronLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../lib/context/NotificationsContext';

export function TopBar({ title, showBack = false, showNotifications = true, rightAction }) {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <header className="top-bar" data-testid="top-bar">
      <div className="flex items-center gap-2">
        {showBack && (
          <button 
            className="top-bar-back" 
            onClick={() => navigate(-1)}
            data-testid="back-button"
            aria-label="Назад"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="top-bar-title">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {rightAction}
        {showNotifications && (
          <button 
            className="nav-item" 
            onClick={() => navigate('/notifications')}
            data-testid="notifications-button"
            aria-label="Уведомления"
            style={{ padding: '0.5rem' }}
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}

export default TopBar;
