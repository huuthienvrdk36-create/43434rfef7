// Provider Quote Details - детали заявки + форма ответа
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotesAPI, organizationsAPI, branchesAPI } from '../../lib/api/client';
import TopBar from '../../components/navigation/TopBar';
import { LoadingOverlay, EmptyState } from '../../components/layout/LoadingStates';
import { 
  MapPin, 
  Clock, 
  Car,
  Send,
  AlertCircle,
  Check
} from 'lucide-react';

export function ProviderQuoteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  
  const [formData, setFormData] = useState({
    price: '',
    comment: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quoteRes, orgsRes] = await Promise.all([
          quotesAPI.getById(id),
          organizationsAPI.getMy(),
        ]);
        
        setQuote(quoteRes.data);
        setOrganizations(orgsRes.data || []);
        
        // Auto-select first org
        if (orgsRes.data?.length > 0) {
          const firstOrg = orgsRes.data[0];
          setSelectedOrg(firstOrg._id || firstOrg.id);
          
          // Fetch branches for first org
          const branchesRes = await branchesAPI.getByOrg(firstOrg._id || firstOrg.id);
          setBranches(branchesRes.data || []);
          
          // Auto-select first branch
          if (branchesRes.data?.length > 0) {
            setSelectedBranch(branchesRes.data[0]._id || branchesRes.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Заявка не найдена');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleOrgChange = async (orgId) => {
    setSelectedOrg(orgId);
    setSelectedBranch('');
    
    try {
      const branchesRes = await branchesAPI.getByOrg(orgId);
      setBranches(branchesRes.data || []);
      if (branchesRes.data?.length > 0) {
        setSelectedBranch(branchesRes.data[0]._id || branchesRes.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBranch || !formData.price) {
      setError('Заполните все обязательные поля');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await quotesAPI.respond(id, {
        branchId: selectedBranch,
        price: parseInt(formData.price, 10),
        comment: formData.comment || undefined,
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/provider/quotes');
      }, 2000);
    } catch (error) {
      console.error('Failed to respond:', error);
      setError(error.response?.data?.message || 'Ошибка отправки ответа');
    } finally {
      setSubmitting(false);
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

  if (error && !quote) {
    return (
      <div className="mobile-shell">
        <TopBar title="Заявка" showBack />
        <EmptyState 
          icon={AlertCircle}
          title="Ошибка"
          description={error}
          action={
            <button className="btn btn-primary mt-4" onClick={() => navigate('/provider/quotes')}>
              К заявкам
            </button>
          }
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="mobile-shell">
        <TopBar title="Заявка" showBack={false} showNotifications={false} />
        <div className="section" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Ответ отправлен!</h2>
            <p className="text-muted">Клиент получит уведомление</p>
          </div>
        </div>
      </div>
    );
  }

  const hasAlreadyResponded = quote?.responses?.some(r => r.isOwn);

  return (
    <div className="mobile-shell" style={{ paddingBottom: 0 }}>
      <TopBar title="Заявка" showBack />

      {/* Quote Info */}
      <section className="section">
        <div className="card mb-4">
          <p className="text-sm text-muted mb-1">Описание проблемы</p>
          <p className="font-medium">{quote?.description}</p>
        </div>

        <div className="flex gap-3 mb-4">
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
              <span>Дата</span>
            </div>
            <p className="font-medium text-sm">{formatDate(quote?.createdAt)}</p>
          </div>
        </div>

        {quote?.vehicle && (
          <div className="card">
            <div className="flex items-center gap-2 text-muted text-sm mb-1">
              <Car size={14} />
              <span>Автомобиль</span>
            </div>
            <p className="font-medium">
              {quote.vehicle.brand} {quote.vehicle.model} ({quote.vehicle.year})
            </p>
          </div>
        )}
      </section>

      {/* Already Responded Notice */}
      {hasAlreadyResponded && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="card" style={{ background: 'hsla(var(--primary), 0.1)', borderColor: 'hsl(var(--primary))' }}>
            <p className="text-primary font-medium">✓ Вы уже ответили на эту заявку</p>
          </div>
        </section>
      )}

      {/* Response Form */}
      {!hasAlreadyResponded && quote?.status === 'pending' && (
        <section className="section">
          <h3 className="font-bold mb-4">Ваш ответ</h3>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="card mb-4" style={{ background: 'hsla(var(--destructive), 0.1)', borderColor: 'hsl(var(--destructive))' }}>
                <p className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>{error}</p>
              </div>
            )}

            {/* Organization Select */}
            {organizations.length > 1 && (
              <div className="input-group">
                <label className="input-label">Организация</label>
                <select
                  className="input-field"
                  value={selectedOrg}
                  onChange={(e) => handleOrgChange(e.target.value)}
                >
                  {organizations.map((org) => (
                    <option key={org._id || org.id} value={org._id || org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Branch Select */}
            {branches.length > 0 && (
              <div className="input-group">
                <label className="input-label">Филиал *</label>
                <select
                  className="input-field"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  required
                >
                  <option value="">Выберите филиал</option>
                  {branches.map((branch) => (
                    <option key={branch._id || branch.id} value={branch._id || branch.id}>
                      {branch.name} — {branch.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price */}
            <div className="input-group">
              <label className="input-label">Цена (₽) *</label>
              <input
                type="number"
                className="input-field"
                placeholder="5000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="1"
                data-testid="respond-price"
              />
            </div>

            {/* Comment */}
            <div className="input-group">
              <label className="input-label">Комментарий</label>
              <textarea
                className="input-field"
                placeholder="Дополнительная информация для клиента..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={3}
                data-testid="respond-comment"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !selectedBranch}
              data-testid="respond-submit"
            >
              {submitting ? 'Отправка...' : (
                <>
                  <Send size={18} />
                  Отправить предложение
                </>
              )}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default ProviderQuoteDetailsPage;
