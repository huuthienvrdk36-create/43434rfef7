// Review Modal Component
import { useState } from 'react';
import { Star, X } from 'lucide-react';

export function ReviewModal({ isOpen, onClose, onSubmit, booking, loading }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  const snapshot = booking?.snapshot || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Оставить отзыв</h2>
          <button 
            className="p-2 rounded-full hover:bg-secondary"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* Service Info */}
        <div className="card mb-4" style={{ background: 'hsl(var(--secondary))' }}>
          <p className="font-medium">{snapshot.serviceName || 'Услуга'}</p>
          <p className="text-sm text-muted">{snapshot.orgName}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating Stars */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">Ваша оценка</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    size={36}
                    fill={(hoveredRating || rating) >= star ? '#FFB800' : 'none'}
                    color={(hoveredRating || rating) >= star ? '#FFB800' : 'hsl(var(--muted-foreground))'}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted mt-2">
              {rating === 1 && 'Очень плохо'}
              {rating === 2 && 'Плохо'}
              {rating === 3 && 'Нормально'}
              {rating === 4 && 'Хорошо'}
              {rating === 5 && 'Отлично!'}
            </p>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Комментарий (необязательно)</label>
            <textarea
              className="input-field"
              placeholder="Расскажите о вашем опыте..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        .modal-content {
          background: hsl(var(--background));
          border-radius: 1rem 1rem 0 0;
          padding: 1.5rem;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default ReviewModal;
