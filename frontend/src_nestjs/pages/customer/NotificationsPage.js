// Notifications Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../lib/context/NotificationsContext';
import TopBar from '../../components/navigation/TopBar';
import { LoadingSpinner, EmptyState } from '../../components/layout/LoadingStates';
import { 
  Bell, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Clock,
  ChevronRight
} from 'lucide-react';

const notificationIcons = {
  QUOTE_CREATED: MessageSquare,
  QUOTE_RESPONDED: MessageSquare,
  QUOTE_ACCEPTED: CheckCircle,
  QUOTE_CANCELLED: XCircle,
  BOOKING_CREATED: Clock,
  BOOKING_CONFIRMED: CheckCircle,
  BOOKING_STARTED: Clock,
  BOOKING_COMPLETED: CheckCircle,
  BOOKING_CANCELLED: XCircle,
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return notifDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    const data = notification.data || {};
    if (data.quoteId) {
      navigate(`/quotes/${data.quoteId}`);
    } else if (data.bookingId) {
      navigate(`/bookings/${data.bookingId}`);
    }
  };

  const Icon = (type) => notificationIcons[type] || Bell;

  return (
    <div className="mobile-shell" style={{ paddingBottom: 0 }}>
      <TopBar 
        title="Уведомления" 
        showBack 
        showNotifications={false}
        rightAction={
          unreadCount > 0 && (
            <button 
              className="btn-ghost text-sm text-primary"
              onClick={markAllAsRead}
            >
              Прочитать все
            </button>
          )
        }
      />

      <section className="section">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : notifications.length > 0 ? (
          <div className="flex flex-col gap-2">
            {notifications.map((notification) => {
              const NotifIcon = Icon(notification.type);
              return (
                <button
                  key={notification.id}
                  className={`card card-interactive flex items-start gap-3 text-left ${
                    !notification.isRead ? 'border-primary' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    borderColor: !notification.isRead ? 'hsl(var(--primary))' : undefined,
                    background: !notification.isRead ? 'hsla(var(--primary), 0.05)' : undefined,
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'hsl(var(--secondary))' }}
                  >
                    <NotifIcon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-medium">{notification.title}</p>
                      <span className="text-xs text-muted flex-shrink-0">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-1 truncate">
                      {notification.message}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted flex-shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="Нет уведомлений"
            description="Здесь будут появляться уведомления о ваших заявках и бронированиях"
          />
        )}
      </section>
    </div>
  );
}

export default NotificationsPage;
