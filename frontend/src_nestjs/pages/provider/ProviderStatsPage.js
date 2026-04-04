// Provider Stats Page - Analytics for providers
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizationsAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { LoadingSpinner } from '../../components/layout/LoadingStates';
import { 
  TrendingUp,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  FileText,
  Zap,
  Award
} from 'lucide-react';

export function ProviderStatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get provider's organization
        const orgRes = await organizationsAPI.getMy();
        const orgs = orgRes.data || [];
        
        if (orgs.length > 0) {
          const org = orgs[0];
          setOrganization(org);
          
          // Get stats for this organization
          const statsRes = await organizationsAPI.getStats(org._id);
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MobileShell>
        <TopBar title="Статистика" showBack />
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </MobileShell>
    );
  }

  if (!stats) {
    return (
      <MobileShell>
        <TopBar title="Статистика" showBack />
        <div className="section text-center py-12">
          <TrendingUp size={48} className="mx-auto mb-4 text-muted" />
          <p className="text-muted">Нет данных</p>
        </div>
      </MobileShell>
    );
  }

  const responseRate = stats.quotesReceived > 0 
    ? Math.round((stats.quotesResponded / stats.quotesReceived) * 100) 
    : 0;

  const conversionRate = stats.quotesResponded > 0
    ? Math.round((stats.completedBookings / stats.quotesResponded) * 100)
    : 0;

  return (
    <MobileShell>
      <TopBar title="Статистика" showBack />

      {/* Rank Score */}
      <section className="section">
        <div 
          className="card text-center"
          style={{ 
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(142 76% 36%) 100%)',
            color: 'white'
          }}
        >
          <Award size={32} className="mx-auto mb-2" />
          <p className="text-sm opacity-80">Рейтинг платформы</p>
          <p className="text-4xl font-bold">{stats.rankScore || 0}</p>
          {stats.isBoosted && (
            <div className="mt-2 px-3 py-1 bg-white/20 rounded-full inline-flex items-center gap-1">
              <Zap size={14} />
              <span className="text-sm">Boost активен</span>
            </div>
          )}
        </div>
      </section>

      {/* Key Metrics */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h3 className="section-title">Ключевые показатели</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Rating */}
          <div className="card text-center">
            <Star size={24} className="mx-auto mb-2 text-yellow-500" fill="#FFB800" />
            <p className="text-2xl font-bold">{stats.rating || 0}</p>
            <p className="text-xs text-muted">Рейтинг</p>
            <p className="text-xs text-muted">{stats.reviewsCount || 0} отзывов</p>
          </div>

          {/* Response Time */}
          <div className="card text-center">
            <Clock size={24} className="mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">
              {stats.avgResponseTimeMinutes 
                ? `${Math.round(stats.avgResponseTimeMinutes)}` 
                : '—'}
            </p>
            <p className="text-xs text-muted">Среднее время ответа</p>
            <p className="text-xs text-muted">минут</p>
          </div>

          {/* Response Rate */}
          <div className="card text-center">
            <MessageSquare size={24} className="mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{responseRate}%</p>
            <p className="text-xs text-muted">Отвечено</p>
            <p className="text-xs text-muted">{stats.quotesResponded}/{stats.quotesReceived}</p>
          </div>

          {/* Conversion */}
          <div className="card text-center">
            <CheckCircle size={24} className="mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted">Конверсия</p>
            <p className="text-xs text-muted">{stats.completedBookings} выполнено</p>
          </div>
        </div>
      </section>

      {/* Activity */}
      <section className="section">
        <h3 className="section-title">Активность</h3>
        <div className="card">
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-muted" />
              <span>Получено заявок</span>
            </div>
            <span className="font-bold">{stats.quotesReceived || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center gap-3">
              <MessageSquare size={20} className="text-muted" />
              <span>Отправлено ответов</span>
            </div>
            <span className="font-bold">{stats.quotesResponded || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-muted" />
              <span>Всего бронирований</span>
            </div>
            <span className="font-bold">{stats.totalBookings || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500" />
              <span>Выполнено</span>
            </div>
            <span className="font-bold text-green-600">{stats.completedBookings || 0}</span>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="section">
        <h3 className="section-title">Как улучшить рейтинг</h3>
        <div className="card" style={{ background: 'hsla(var(--primary), 0.1)' }}>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 text-primary" />
              <span>Отвечайте на заявки быстрее — это влияет на ваш рейтинг</span>
            </li>
            <li className="flex items-start gap-2">
              <Star size={16} className="mt-0.5 text-primary" />
              <span>Просите клиентов оставлять отзывы после завершения работ</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 text-primary" />
              <span>Выполняйте больше заказов для повышения позиции</span>
            </li>
            <li className="flex items-start gap-2">
              <Zap size={16} className="mt-0.5 text-primary" />
              <span>Используйте Boost для временного продвижения</span>
            </li>
          </ul>
        </div>
      </section>
    </MobileShell>
  );
}

export default ProviderStatsPage;
