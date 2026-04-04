// Quote Details Page - детали заявки и ответы
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { quotesAPI } from '../../lib/api/client';
import TopBar from '../../components/navigation/TopBar';
import StatusBadge from '../../components/cards/StatusBadge';
import { LoadingOverlay, EmptyState } from '../../components/layout/LoadingStates';
import { 
  MapPin, 
  Clock, 
  Check, 
  MessageSquare,
  Building2,
  AlertCircle
} from 'lucide-react';

export function QuoteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isJustCreated = searchParams.get('created') === 'true';

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await quotesAPI.getById(id);
        setQuote(response.data);
      } catch (error) {
        console.error('Failed to fetch quote:', error);
        setError('Заявка не найдена');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [id]);

  const handleAcceptResponse = async (responseId) => {
    setAccepting(responseId);
    try {
      const response = await quotesAPI.accept(id, responseId);
      const bookingId = response.data?.bookingId || response.data?.booking?._id;
      
      if (bookingId) {
        navigate(`/bookings/${bookingId}?accepted=true`);
      } else {
        // Refresh quote to see updated status
        const updatedQuote = await quotesAPI.getById(id);
        setQuote(updatedQuote.data);
      }
    } catch (error) {
      console.error('Failed to accept response:', error);
      alert(error.response?.data?.message || 'Ошибка при принятии предложения');
    } finally {
      setAccepting(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <LoadingOverlay />;

  if (error) {
    return (
      <div className="mobile-shell">
        <TopBar title="Заявка" showBack />
        <EmptyState 
          icon={AlertCircle}
          title="Ошибка"
          description={error}
          action={
            <button className="btn btn-primary mt-4" onClick={() => navigate('/quotes')}>
              К заявкам
            </button>
          }
        />
      </div>
    );
  }

  const responses = quote?.responses || [];
  const canAccept = ['pending', 'responded'].includes(quote?.status);

  return (
    <div className="mobile-shell" style={{ paddingBottom: 0 }}>
      <TopBar title="Заявка" showBack />

      {/* Success Banner */}
      {isJustCreated && (
        <div className="section">
          <div className="card" style={{ background: 'hsla(var(--primary), 0.1)', borderColor: 'hsl(var(--primary))' }}>
            <div className="flex items-center gap-3">
              <Check size={24} className="text-primary" />
              <div>
                <p className="font-semibold text-primary">Заявка создана!</p>
                <p className="text-sm text-muted">Ожидайте ответы от сервисов</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Info */}
      <section className="section">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold">Детали заявки</h2>
          <StatusBadge status={quote?.status} />
        </div>

        <div className="card mb-4">
          <p className="text-muted text-sm mb-1">Описание</p>
          <p className="font-medium">{quote?.description}</p>
        </div>

        <div className="flex gap-4">
          <div className="card flex-1">
            <div className="flex items-center gap-2 text-muted text-sm mb-1">
              <MapPin size={14} />
              <span>Город</span>
            </div>
            <p className="font-medium">{quote?.city || '—'}</p>
          </div>
          <div className="card flex-1">
            <div className="flex items-center gap-2 text-muted text-sm mb-1">
              <Clock size={14} />
              <span>Создана</span>
            </div>
            <p className="font-medium text-sm">{formatDate(quote?.createdAt)}</p>
          </div>
        </div>
      </section>

      {/* Responses */}
      <section className="section" style={{ paddingBottom: '2rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={20} />
          <h3 className="font-bold">
            Ответы ({responses.length})
          </h3>
        </div>

        {responses.length === 0 ? (
          <div className="card text-center py-8">
            <MessageSquare size={48} className="mx-auto mb-3" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <p className="text-muted">Пока нет ответов</p>
            <p className="text-sm text-muted mt-1">
              Сервисы скоро увидят вашу заявку
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {responses.map((response) => (
              <div 
                key={response._id || response.id} 
                className="card"
                data-testid={`response-${response._id || response.id}`}
              >
                {/* Provider Info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Building2 size={24} className="text-muted" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {response.branch?.organization?.name || response.organizationName || 'Сервис'}
                    </p>
                    <p className="text-sm text-muted">
                      {response.branch?.address || 'Адрес не указан'}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-muted">Цена:</span>
                  <span className="text-xl font-bold text-primary">
                    {response.price?.toLocaleString()} ₽
                  </span>
                </div>

                {/* Comment */}
                {response.comment && (
                  <p className="text-sm text-muted mb-3">
                    "{response.comment}"
                  </p>
                )}

                {/* Accept Button */}
                {canAccept && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAcceptResponse(response._id || response.id)}
                    disabled={accepting !== null}
                    data-testid={`accept-response-${response._id || response.id}`}
                  >
                    {accepting === (response._id || response.id) ? 'Обработка...' : 'Выбрать это предложение'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default QuoteDetailsPage;
