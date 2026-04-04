// Favorites Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoritesAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { LoadingSpinner, EmptyState } from '../../components/layout/LoadingStates';
import { 
  Heart, 
  Star, 
  MapPin,
  ChevronRight,
  Building2,
  Trash2
} from 'lucide-react';

export function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await favoritesAPI.getMy();
        setFavorites(res.data || []);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (orgId) => {
    try {
      await favoritesAPI.remove(orgId);
      setFavorites(favorites.filter((f) => String(f.organizationId) !== orgId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  return (
    <MobileShell>
      <TopBar title="Избранное" showBack />

      <section className="section">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : favorites.length > 0 ? (
          <div className="flex flex-col gap-3">
            {favorites.map((fav) => (
              <div
                key={fav._id}
                className="card card-interactive"
                onClick={() => navigate(`/organization/${fav.organizationId}`)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'hsl(var(--secondary))' }}
                  >
                    <Building2 size={24} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{fav.snapshot?.name || 'СТО'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {fav.snapshot?.ratingAvg > 0 && (
                        <div className="flex items-center gap-1">
                          <Star size={14} fill="#FFB800" color="#FFB800" />
                          <span className="text-sm">{fav.snapshot.ratingAvg}</span>
                        </div>
                      )}
                      {fav.snapshot?.city && (
                        <span className="text-xs text-muted flex items-center gap-1">
                          <MapPin size={12} />
                          {fav.snapshot.city}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(String(fav.organizationId));
                    }}
                  >
                    <Heart size={22} fill="#EF4444" color="#EF4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Нет избранных"
            description="Добавляйте СТО в избранное для быстрого доступа"
            action={
              <button 
                className="btn btn-primary mt-4"
                onClick={() => navigate('/map')}
              >
                Найти СТО
              </button>
            }
          />
        )}
      </section>
    </MobileShell>
  );
}

export default FavoritesPage;
