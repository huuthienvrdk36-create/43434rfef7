// Provider Incoming Quotes - входящие заявки
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotesAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { LoadingSpinner, EmptyState } from '../../components/layout/LoadingStates';
import { FileText, MapPin, Clock, ChevronRight } from 'lucide-react';

export function ProviderQuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, responded, all

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await quotesAPI.getIncoming();
        setQuotes(response.data || []);
      } catch (error) {
        console.error('Failed to fetch quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  const filteredQuotes = quotes.filter((quote) => {
    if (filter === 'pending') return quote.status === 'pending';
    if (filter === 'responded') return quote.status === 'responded';
    return true;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filters = [
    { id: 'pending', label: 'Новые' },
    { id: 'responded', label: 'С ответом' },
    { id: 'all', label: 'Все' },
  ];

  return (
    <MobileShell isProvider>
      <TopBar title="Входящие заявки" showBack={false} />

      {/* Filters */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              className={`btn ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <section className="section">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredQuotes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredQuotes.map((quote) => {
              const hasResponded = quote.responses?.some(r => r.isOwn);
              return (
                <div 
                  key={quote._id || quote.id}
                  className="card card-interactive"
                  onClick={() => navigate(`/provider/quotes/${quote._id || quote.id}`)}
                  data-testid={`provider-quote-${quote._id || quote.id}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`status-badge ${quote.status === 'pending' ? 'status-pending' : 'status-confirmed'}`}>
                      {quote.status === 'pending' ? 'Новая' : 'Есть ответы'}
                    </span>
                    <ChevronRight size={20} className="text-muted" />
                  </div>

                  <p className="font-medium mb-2" style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {quote.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{quote.city || 'Город не указан'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDate(quote.createdAt)}</span>
                    </div>
                  </div>

                  {hasResponded && (
                    <p className="text-xs text-primary mt-2">✓ Вы уже ответили</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="Нет заявок"
            description={
              filter === 'pending' 
                ? "Новые заявки появятся здесь"
                : "Нет заявок в этой категории"
            }
          />
        )}
      </section>
    </MobileShell>
  );
}

export default ProviderQuotesPage;
