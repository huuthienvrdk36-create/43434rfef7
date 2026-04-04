// Organization Details Page
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { organizationsAPI, reviewsAPI, favoritesAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { LoadingOverlay, EmptyState } from '../../components/layout/LoadingStates';
import { 
  MapPin, 
  Star, 
  Phone,
  Clock,
  Heart,
  Plus,
  ChevronRight,
  Building2,
  Wrench,
  MessageSquare
} from 'lucide-react';

export function OrganizationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [branches, setBranches] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // info, reviews

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orgRes, branchesRes, reviewsRes, statsRes, favRes] = await Promise.all([
          organizationsAPI.getById(id),
          fetch(`/api/branches/organization/${id}`).then((r) => r.json()).catch(() => []),
          reviewsAPI.getByOrganization(id, { limit: 10 }),
          reviewsAPI.getOrganizationStats(id),
          favoritesAPI.check(id).catch(() => ({ data: { isFavorite: false } })),
        ]);

        setOrganization(orgRes.data);
        setBranches(branchesRes || []);
        setReviews(reviewsRes.data?.reviews || []);
        setReviewStats(statsRes.data);
        setIsFavorite(favRes.data?.isFavorite || false);
      } catch (error) {
        console.error('Failed to fetch organization:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoritesAPI.remove(id);
        setIsFavorite(false);
      } else {
        await favoritesAPI.add(id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Toggle favorite failed:', error);
    }
  };

  const createQuote = () => {
    navigate(`/quotes/create?organizationId=${id}`);
  };

  if (loading) return <LoadingOverlay />;

  if (!organization) {
    return (
      <MobileShell>
        <TopBar title="СТО" showBack />
        <EmptyState
          icon={Building2}
          title="Не найдено"
          description="Организация не найдена"
        />
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <TopBar 
        title={organization.name} 
        showBack 
        rightAction={
          <button onClick={toggleFavorite} className="p-2">
            <Heart
              size={24}
              fill={isFavorite ? '#EF4444' : 'none'}
              color={isFavorite ? '#EF4444' : 'hsl(var(--foreground))'}
            />
          </button>
        }
      />

      {/* Hero */}
      <section className="section">
        <div className="card">
          <div className="flex items-start gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center relative"
              style={{ background: 'hsl(var(--primary))' }}
            >
              <Building2 size={32} className="text-white" />
              {organization.isBoosted && (
                <div 
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: '#FF6B00' }}
                  title="Продвигается"
                >
                  <span className="text-white text-xs">🔥</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{organization.name}</h1>
                {organization.isBoosted && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: '#FF6B00', color: 'white' }}
                  >
                    🔥 Продвигается
                  </span>
                )}
              </div>
              {reviewStats && reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <Star size={18} fill="#FFB800" color="#FFB800" />
                  <span className="font-bold">{reviewStats.averageRating}</span>
                  <span className="text-sm text-muted">({reviewStats.totalReviews} отзывов)</span>
                </div>
              )}
              {organization.avgResponseTimeMinutes && (
                <p className="text-xs text-muted mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  Отвечает за {organization.avgResponseTimeMinutes < 60 
                    ? `${Math.round(organization.avgResponseTimeMinutes)} мин` 
                    : `${Math.round(organization.avgResponseTimeMinutes / 60)} ч`}
                </p>
              )}
            </div>
          </div>

          {organization.description && (
            <p className="text-sm text-muted">{organization.description}</p>
          )}

          {/* Specializations */}
          {organization.specializations?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {organization.specializations.map((spec, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 text-xs rounded-full"
                  style={{ background: 'hsl(var(--secondary))' }}
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Action */}
      <section className="section" style={{ paddingTop: 0 }}>
        <button
          className="btn btn-primary w-full"
          onClick={createQuote}
          data-testid="create-quote-org"
        >
          <Plus size={20} />
          Создать заявку
        </button>
      </section>

      {/* Tabs */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="flex gap-2">
          <button
            className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setActiveTab('info')}
          >
            Инфо
          </button>
          <button
            className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setActiveTab('reviews')}
          >
            Отзывы ({reviewStats?.totalReviews || 0})
          </button>
        </div>
      </section>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <>
          {/* Branches */}
          {branches.length > 0 && (
            <section className="section">
              <h3 className="section-title">Филиалы</h3>
              <div className="flex flex-col gap-3">
                {branches.map((branch) => (
                  <div key={branch._id} className="card">
                    <p className="font-medium">{branch.name}</p>
                    <div className="flex items-start gap-2 mt-2 text-sm text-muted">
                      <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </div>
                    {branch.phone && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted">
                        <Phone size={16} />
                        <span>{branch.phone}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact */}
          <section className="section">
            <h3 className="section-title">Контакты</h3>
            <div className="card">
              {organization.contactPhone && (
                <div className="flex items-center gap-3 mb-3">
                  <Phone size={20} className="text-muted" />
                  <a href={`tel:${organization.contactPhone}`} className="text-primary">
                    {organization.contactPhone}
                  </a>
                </div>
              )}
              {organization.contactEmail && (
                <div className="flex items-center gap-3">
                  <MessageSquare size={20} className="text-muted" />
                  <a href={`mailto:${organization.contactEmail}`} className="text-primary">
                    {organization.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {activeTab === 'reviews' && (
        <section className="section">
          {/* Rating Summary */}
          {reviewStats && reviewStats.totalReviews > 0 && (
            <div className="card mb-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">{reviewStats.averageRating}</p>
                  <div className="flex items-center gap-1 justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= Math.round(reviewStats.averageRating) ? '#FFB800' : 'none'}
                        color={star <= Math.round(reviewStats.averageRating) ? '#FFB800' : 'hsl(var(--muted-foreground))'}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted mt-1">{reviewStats.totalReviews} отзывов</p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviewStats.distribution?.[rating] || 0;
                    const percent = reviewStats.totalReviews > 0 
                      ? (count / reviewStats.totalReviews) * 100 
                      : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2 text-xs mb-1">
                        <span className="w-3">{rating}</span>
                        <div 
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ background: 'hsl(var(--secondary))' }}
                        >
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${percent}%`,
                              background: '#FFB800'
                            }}
                          />
                        </div>
                        <span className="w-6 text-muted">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <div key={review._id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= review.rating ? '#FFB800' : 'none'}
                          color={star <= review.rating ? '#FFB800' : 'hsl(var(--muted-foreground))'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  {review.snapshot?.userName && (
                    <p className="text-sm font-medium">{review.snapshot.userName}</p>
                  )}
                  {review.comment && (
                    <p className="text-sm text-muted mt-2">{review.comment}</p>
                  )}
                  {review.snapshot?.serviceName && (
                    <p className="text-xs text-muted mt-2 flex items-center gap-1">
                      <Wrench size={12} />
                      {review.snapshot.serviceName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <MessageSquare size={48} className="mx-auto mb-3 text-muted" />
              <p className="text-muted">Пока нет отзывов</p>
            </div>
          )}
        </section>
      )}
    </MobileShell>
  );
}

export default OrganizationDetailsPage;
