// Market Page - каталог СТО и услуг
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI, organizationsAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { LoadingSpinner, EmptyState } from '../../components/layout/LoadingStates';
import { 
  Search, 
  Wrench, 
  Building2, 
  MapPin, 
  ChevronRight,
  Star
} from 'lucide-react';

export function MarketPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('categories'); // categories, providers

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, orgsRes] = await Promise.all([
          servicesAPI.getCategories(),
          organizationsAPI.getMy().catch(() => ({ data: [] })), // Fallback if no orgs
        ]);
        
        setCategories(categoriesRes.data || []);
        
        // For now, show all organizations (in production, this would be a public endpoint)
        // Using mock data for demo
        setOrganizations([
          {
            _id: 'org1',
            name: 'Автосервис "Мастер"',
            description: 'Полный спектр услуг по ремонту автомобилей',
            city: 'Москва',
            rating: 4.8,
            reviewsCount: 156,
            priceFrom: 500,
          },
          {
            _id: 'org2',
            name: 'СТО Профи',
            description: 'Диагностика и ремонт ходовой части',
            city: 'Москва',
            rating: 4.5,
            reviewsCount: 89,
            priceFrom: 800,
          },
          {
            _id: 'org3',
            name: 'Кузовной центр',
            description: 'Кузовной ремонт и покраска',
            city: 'Санкт-Петербург',
            rating: 4.9,
            reviewsCount: 234,
            priceFrom: 2000,
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryClick = (category) => {
    navigate(`/quotes/create?category=${category._id || category.id}&name=${encodeURIComponent(category.name)}`);
  };

  const handleOrgClick = (org) => {
    navigate(`/market/organization/${org._id || org.id}`);
  };

  return (
    <MobileShell>
      <TopBar title="Маркет" showBack={false} />

      {/* Search */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="relative">
          <Search 
            size={20} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            className="input-field"
            placeholder="Поиск услуг или СТО..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
            data-testid="market-search"
          />
        </div>
      </section>

      {/* Tabs */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="flex gap-2">
          <button
            className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setActiveTab('categories')}
          >
            Услуги
          </button>
          <button
            className={`btn ${activeTab === 'providers' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setActiveTab('providers')}
          >
            СТО
          </button>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : activeTab === 'categories' ? (
          // Categories List
          filteredCategories.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filteredCategories.map((category) => (
                <button
                  key={category._id || category.id}
                  className="card card-interactive flex items-center gap-4"
                  onClick={() => handleCategoryClick(category)}
                  data-testid={`category-${category._id || category.id}`}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'hsl(var(--secondary))' }}
                  >
                    <Wrench size={24} className="text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-muted truncate">{category.description}</p>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-muted" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Wrench}
              title="Ничего не найдено"
              description="Попробуйте изменить поисковый запрос"
            />
          )
        ) : (
          // Organizations List
          filteredOrgs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredOrgs.map((org) => (
                <div
                  key={org._id || org.id}
                  className="card card-interactive"
                  onClick={() => handleOrgClick(org)}
                  data-testid={`org-${org._id || org.id}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ background: 'hsl(var(--secondary))' }}
                    >
                      <Building2 size={28} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{org.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500" fill="currentColor" />
                          <span className="text-sm font-medium">{org.rating}</span>
                        </div>
                        <span className="text-xs text-muted">({org.reviewsCount} отзывов)</span>
                      </div>
                    </div>
                  </div>

                  {org.description && (
                    <p className="text-sm text-muted mb-3 truncate">{org.description}</p>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1 text-muted">
                      <MapPin size={14} />
                      <span>{org.city}</span>
                    </div>
                    <span className="text-primary font-medium">
                      от {org.priceFrom?.toLocaleString()} ₽
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="СТО не найдены"
              description="Попробуйте изменить поисковый запрос"
            />
          )
        )}
      </section>

      {/* CTA */}
      <section className="section">
        <div className="card text-center py-4" style={{ background: 'hsla(var(--primary), 0.1)' }}>
          <p className="font-medium mb-2">Не нашли подходящий сервис?</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/quotes/create')}
          >
            Создать заявку
          </button>
          <p className="text-xs text-muted mt-2">
            Сервисы сами предложат свои услуги
          </p>
        </div>
      </section>
    </MobileShell>
  );
}

export default MarketPage;
