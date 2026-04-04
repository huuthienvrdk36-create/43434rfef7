// Booking Details Page with Review functionality
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { bookingsAPI, reviewsAPI } from '../../lib/api/client';
import TopBar from '../../components/navigation/TopBar';
import StatusBadge from '../../components/cards/StatusBadge';
import ReviewModal from '../../components/cards/ReviewModal';
import { LoadingOverlay, EmptyState } from '../../components/layout/LoadingStates';
import { 
  MapPin, 
  Calendar, 
  Phone, 
  Check,
  AlertCircle,
  Building2,
  Star,
  MessageSquare
} from 'lucide-react';

const statusTimeline = [
  { status: 'pending', label: 'Ожидание' },
  { status: 'confirmed', label: 'Подтверждён' },
  { status: 'in_progress', label: 'В работе' },
  { status: 'completed', label: 'Завершён' },
];

export function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isJustAccepted = searchParams.get('accepted') === 'true';

  const [booking, setBooking] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingRes = await bookingsAPI.getById(id);
        setBooking(bookingRes.data);

        // Check if review exists for completed bookings
        if (bookingRes.data?.status === 'completed') {
          try {
            const reviewRes = await reviewsAPI.getByBooking(id);
            setReview(reviewRes.data);
          } catch {
            // No review exists yet - that's okay
          }
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
        setError('Бронирование не найдено');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmitReview = async ({ rating, comment }) => {
    setReviewSubmitting(true);
    try {
      const res = await reviewsAPI.create({
        bookingId: id,
        rating,
        comment,
      });
      setReview(res.data);
      setShowReviewModal(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert(error.response?.data?.message || 'Ошибка отправки отзыва');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Не назначена';
    return new Date(date).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIndex = (status) => {
    const index = statusTimeline.findIndex(s => s.status === status);
    return index >= 0 ? index : 0;
  };

  if (loading) return <LoadingOverlay />;

  if (error) {
    return (
      <div className="mobile-shell">
        <TopBar title="Бронирование" showBack />
        <EmptyState 
          icon={AlertCircle}
          title="Ошибка"
          description={error}
          action={
            <button className="btn btn-primary mt-4" onClick={() => navigate('/orders')}>
              К заказам
            </button>
          }
        />
      </div>
    );
  }

  const snapshot = booking?.snapshot || {};
  const currentStatusIndex = getStatusIndex(booking?.status);
  const isCancelled = ['cancelled', 'no_show'].includes(booking?.status);
  const isCompleted = booking?.status === 'completed';
  const canReview = isCompleted && !review;

  return (
    <div className="mobile-shell" style={{ paddingBottom: 0 }}>
      <TopBar title="Бронирование" showBack />

      {/* Success Banner */}
      {isJustAccepted && (
        <div className="section">
          <div className="card" style={{ background: 'hsla(var(--primary), 0.1)', borderColor: 'hsl(var(--primary))' }}>
            <div className="flex items-center gap-3">
              <Check size={24} className="text-primary" />
              <div>
                <p className="font-semibold text-primary">Бронирование создано!</p>
                <p className="text-sm text-muted">Сервис скоро подтвердит запись</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      {!isCancelled && (
        <section className="section">
          <h3 className="font-bold mb-4">Статус</h3>
          <div className="flex justify-between items-center relative">
            {/* Progress line */}
            <div 
              className="absolute top-3 left-0 right-0 h-0.5"
              style={{ background: 'hsl(var(--border))' }}
            />
            <div 
              className="absolute top-3 left-0 h-0.5 transition-all duration-500"
              style={{ 
                background: 'hsl(var(--primary))',
                width: `${(currentStatusIndex / (statusTimeline.length - 1)) * 100}%`
              }}
            />

            {statusTimeline.map((step, index) => (
              <div key={step.status} className="relative flex flex-col items-center" style={{ zIndex: 1 }}>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: index <= currentStatusIndex 
                      ? 'hsl(var(--primary))' 
                      : 'hsl(var(--secondary))',
                    color: index <= currentStatusIndex 
                      ? 'hsl(var(--primary-foreground))' 
                      : 'hsl(var(--muted-foreground))',
                    border: '2px solid hsl(var(--background))'
                  }}
                >
                  {index < currentStatusIndex ? <Check size={14} /> : index + 1}
                </div>
                <span className="text-xs mt-2 text-center" style={{ 
                  color: index <= currentStatusIndex 
                    ? 'hsl(var(--foreground))' 
                    : 'hsl(var(--muted-foreground))'
                }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cancelled Status */}
      {isCancelled && (
        <section className="section">
          <div className="card" style={{ background: 'hsla(var(--destructive), 0.1)' }}>
            <div className="flex items-center gap-3">
              <AlertCircle size={24} style={{ color: 'hsl(var(--destructive))' }} />
              <div>
                <p className="font-semibold" style={{ color: 'hsl(var(--destructive))' }}>
                  {booking?.status === 'no_show' ? 'Неявка' : 'Отменено'}
                </p>
                <p className="text-sm text-muted">
                  {booking?.cancelReason || 'Причина не указана'}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Existing Review */}
      {review && (
        <section className="section">
          <h3 className="font-bold mb-4">Ваш отзыв</h3>
          <div className="card" style={{ background: 'hsla(142, 76%, 36%, 0.1)', borderColor: 'hsl(142, 76%, 36%)' }}>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  fill={star <= review.rating ? '#FFB800' : 'none'}
                  color={star <= review.rating ? '#FFB800' : 'hsl(var(--muted-foreground))'}
                />
              ))}
              <span className="ml-2 font-medium">{review.rating}/5</span>
            </div>
            {review.comment && (
              <p className="text-sm mt-2">{review.comment}</p>
            )}
            <p className="text-xs text-muted mt-2">
              {new Date(review.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </section>
      )}

      {/* Service Info */}
      <section className="section">
        <h3 className="font-bold mb-4">Услуга</h3>
        <div className="card">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold text-lg">{snapshot.serviceName || 'Услуга'}</p>
              {snapshot.categoryName && (
                <p className="text-sm text-muted">{snapshot.categoryName}</p>
              )}
            </div>
            <StatusBadge status={booking?.status} />
          </div>
          {(snapshot.vehicleBrand || snapshot.vehicleModel) && (
            <div className="flex items-center gap-2 mb-3 text-sm text-muted">
              <span>Авто: {snapshot.vehicleBrand} {snapshot.vehicleModel}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <span className="text-muted">Стоимость:</span>
            <span className="text-2xl font-bold text-primary">
              {snapshot.price?.toLocaleString() || '—'} ₽
            </span>
          </div>
        </div>
      </section>

      {/* Provider Info */}
      <section className="section">
        <h3 className="font-bold mb-4">Сервис</h3>
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Building2 size={24} className="text-muted" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{snapshot.orgName || 'Сервис'}</p>
              {snapshot.branchName && (
                <p className="text-sm text-muted">{snapshot.branchName}</p>
              )}
            </div>
          </div>

          {snapshot.branchAddress && (
            <div className="flex items-start gap-3 text-sm mb-3">
              <MapPin size={18} className="text-muted flex-shrink-0 mt-0.5" />
              <span>{snapshot.branchAddress}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Calendar size={18} className="text-muted" />
            <span>{formatDate(booking?.scheduledAt)}</span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="section" style={{ paddingBottom: '2rem' }}>
        <div className="flex gap-3">
          {/* Review Button for completed bookings */}
          {canReview && (
            <button 
              className="btn btn-primary flex-1"
              onClick={() => setShowReviewModal(true)}
              data-testid="leave-review-button"
            >
              <Star size={18} />
              Оставить отзыв
            </button>
          )}

          {!isCancelled && !isCompleted && (
            <>
              <button className="btn btn-secondary flex-1">
                <Phone size={18} />
                Связаться
              </button>
              {booking?.status === 'pending' && (
                <button 
                  className="btn btn-ghost flex-1"
                  style={{ color: 'hsl(var(--destructive))' }}
                >
                  Отменить
                </button>
              )}
            </>
          )}

          {/* Back to orders if completed with review */}
          {isCompleted && review && (
            <button 
              className="btn btn-secondary flex-1"
              onClick={() => navigate('/orders')}
            >
              К заказам
            </button>
          )}
        </div>
      </section>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        booking={booking}
        loading={reviewSubmitting}
      />
    </div>
  );
}

export default BookingDetailsPage;
