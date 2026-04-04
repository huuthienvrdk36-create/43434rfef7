// Map Page with Leaflet - Discovery via Map
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoveryAPI, geoAPI, favoritesAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { LoadingSpinner } from '../../components/layout/LoadingStates';
import { 
  MapPin, 
  Star, 
  Navigation,
  Search,
  ChevronUp,
  ChevronDown,
  Heart,
  Building2
} from 'lucide-react';

// Default center (Moscow)
const DEFAULT_CENTER = { lat: 55.7558, lng: 37.6173 };

export function MapPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Moscow');
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Use default on error
          setUserLocation(DEFAULT_CENTER);
        }
      );
    } else {
      setUserLocation(DEFAULT_CENTER);
    }
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [branchesRes, citiesRes, favoritesRes] = await Promise.all([
          discoveryAPI.nearby({
            lat: userLocation?.lat || DEFAULT_CENTER.lat,
            lng: userLocation?.lng || DEFAULT_CENTER.lng,
            radius: 50,
            city: selectedCity,
            limit: 30,
          }),
          geoAPI.getCities({}),
          favoritesAPI.getMy().catch(() => ({ data: [] })),
        ]);

        setBranches(branchesRes.data || []);
        setCities(citiesRes.data || []);
        setFavoriteIds((favoritesRes.data || []).map((f) => String(f.organizationId)));
      } catch (error) {
        console.error('Failed to fetch map data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      fetchData();
    }
  }, [userLocation, selectedCity]);

  // Search branches
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const res = await discoveryAPI.search({
        q: searchQuery,
        city: selectedCity,
        limit: 20,
      });
      setBranches(res.data || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (branch) => {
    const orgId = String(branch.organizationId);
    const isFav = favoriteIds.includes(orgId);

    try {
      if (isFav) {
        await favoritesAPI.remove(orgId);
        setFavoriteIds(favoriteIds.filter((id) => id !== orgId));
      } else {
        await favoritesAPI.add(orgId);
        setFavoriteIds([...favoriteIds, orgId]);
      }
    } catch (error) {
      console.error('Toggle favorite failed:', error);
    }
  };

  const openOrganization = (branch) => {
    navigate(`/organization/${branch.organizationId}`);
  };

  return (
    <MobileShell hideNav>
      <div className="flex flex-col h-full">
        <TopBar title="Карта СТО" showBack />

        {/* Search Bar */}
        <div className="section" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                className="input-field"
                placeholder="Поиск СТО..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ paddingLeft: '2.5rem', height: '40px' }}
              />
            </div>
            <select
              className="input-field"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ width: '120px', height: '40px' }}
            >
              <option value="">All</option>
              {cities.map((city) => (
                <option key={city._id || city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Map Area (placeholder - using list view) */}
        <div 
          className="flex-1 relative"
          style={{ 
            background: 'linear-gradient(180deg, hsl(var(--secondary)) 0%, hsl(var(--background)) 100%)',
            minHeight: '200px'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="mx-auto mb-2" style={{ color: 'hsl(var(--primary))' }} />
              <p className="text-muted text-sm">Интерактивная карта</p>
              <p className="text-xs text-muted">{branches.length} СТО рядом</p>
            </div>
          </div>

          {/* My Location Button */}
          <button
            className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center"
            style={{ zIndex: 10 }}
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                  });
                });
              }
            }}
          >
            <Navigation size={24} className="text-primary" />
          </button>
        </div>

        {/* Bottom Sheet */}
        <div 
          className="bg-background rounded-t-2xl shadow-lg transition-all duration-300"
          style={{
            maxHeight: sheetExpanded ? '60vh' : '80px',
            minHeight: '80px',
          }}
        >
          {/* Sheet Handle */}
          <button
            className="w-full py-3 flex justify-center"
            onClick={() => setSheetExpanded(!sheetExpanded)}
          >
            <div className="flex items-center gap-2">
              {sheetExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              <span className="text-sm font-medium">
                {branches.length} СТО {sheetExpanded ? '' : '— нажмите для списка'}
              </span>
            </div>
          </button>

          {/* Branch List */}
          {sheetExpanded && (
            <div 
              className="overflow-y-auto px-4 pb-4"
              style={{ maxHeight: 'calc(60vh - 50px)' }}
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : branches.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {branches.map((branch) => (
                    <div
                      key={branch._id}
                      className="card card-interactive"
                      onClick={() => openOrganization(branch)}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'hsl(var(--secondary))' }}
                        >
                          <Building2 size={24} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-semibold truncate">
                              {branch.organization?.name || branch.name}
                            </p>
                            {branch.organization?.isBoosted && (
                              <span className="text-xs" title="Продвигается">🔥</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {(branch.organization?.ratingAvg > 0 || branch.ratingAvg > 0) && (
                              <div className="flex items-center gap-1">
                                <Star size={14} fill="#FFB800" color="#FFB800" />
                                <span className="text-sm font-medium">
                                  {branch.organization?.ratingAvg || branch.ratingAvg || 0}
                                </span>
                              </div>
                            )}
                            {branch.distance !== null && (
                              <span className="text-xs text-muted">
                                {branch.distance} км
                              </span>
                            )}
                            {branch.organization?.avgResponseTimeMinutes && (
                              <span className="text-xs text-muted flex items-center gap-1">
                                ⚡ {branch.organization.avgResponseTimeMinutes < 60
                                  ? `${Math.round(branch.organization.avgResponseTimeMinutes)} мин`
                                  : `${Math.round(branch.organization.avgResponseTimeMinutes / 60)} ч`}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted mt-1 truncate">
                            <MapPin size={12} className="inline mr-1" />
                            {branch.address}
                          </p>
                        </div>
                        <button
                          className="p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(branch);
                          }}
                        >
                          <Heart
                            size={22}
                            fill={favoriteIds.includes(String(branch.organizationId)) ? '#EF4444' : 'none'}
                            color={favoriteIds.includes(String(branch.organizationId)) ? '#EF4444' : 'hsl(var(--muted-foreground))'}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 size={48} className="mx-auto mb-3 text-muted" />
                  <p className="text-muted">СТО не найдены</p>
                  <p className="text-xs text-muted mt-1">
                    Попробуйте другой город или поиск
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

export default MapPage;
