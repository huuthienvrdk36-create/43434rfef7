// My Quotes Page - список заявок
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotesAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import QuoteCard from '../../components/cards/QuoteCard';
import { LoadingSpinner, EmptyState } from '../../components/layout/LoadingStates';
import { FileText, Plus } from 'lucide-react';

export function QuotesListPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await quotesAPI.getMy();
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
    if (filter === 'active') {
      return ['pending', 'responded'].includes(quote.status);
    }
    if (filter === 'completed') {
      return ['accepted', 'cancelled', 'expired'].includes(quote.status);
    }
    return true;
  });

  const filters = [
    { id: 'all', label: 'Все' },
    { id: 'active', label: 'Активные' },
    { id: 'completed', label: 'Завершённые' },
  ];

  return (
    <MobileShell>
      <TopBar title="Мои заявки" showBack={false} />

      {/* Filters */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              className={`btn ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => setFilter(f.id)}
              data-testid={`filter-${f.id}`}
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
            {filteredQuotes.map((quote) => (
              <QuoteCard key={quote._id || quote.id} quote={quote} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="Нет заявок"
            description={
              filter === 'all' 
                ? "Создайте первую заявку, чтобы получить предложения от сервисов"
                : "Нет заявок в этой категории"
            }
            action={
              filter === 'all' && (
                <button 
                  className="btn btn-primary mt-4"
                  onClick={() => navigate('/quotes/create')}
                >
                  <Plus size={20} />
                  Создать заявку
                </button>
              )
            }
          />
        )}
      </section>
    </MobileShell>
  );
}

export default QuotesListPage;
