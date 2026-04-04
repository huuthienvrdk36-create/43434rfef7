// Quote Card компонент
import { ChevronRight, MessageSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export function QuoteCard({ quote }) {
  const navigate = useNavigate();
  const responsesCount = quote.responses?.length || 0;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className="card card-interactive"
      onClick={() => navigate(`/quotes/${quote._id || quote.id}`)}
      data-testid={`quote-card-${quote._id || quote.id}`}
    >
      <div className="flex justify-between items-start mb-2">
        <StatusBadge status={quote.status} />
        <ChevronRight size={20} className="text-muted" />
      </div>

      <p className="font-medium mb-2 truncate" style={{ maxWidth: '100%' }}>
        {quote.description || 'Без описания'}
      </p>

      <div className="flex items-center gap-4 text-sm text-muted">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{formatDate(quote.createdAt)}</span>
        </div>
        {responsesCount > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{responsesCount} ответ{responsesCount > 1 ? 'а' : ''}</span>
          </div>
        )}
      </div>

      {quote.city && (
        <p className="text-xs text-muted mt-2">
          {quote.city}
        </p>
      )}
    </div>
  );
}

export default QuoteCard;
