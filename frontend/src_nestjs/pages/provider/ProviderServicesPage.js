// Provider Services Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizationsAPI, branchesAPI, servicesAPI } from '../../lib/api/client';
import MobileShell from '../../components/layout/MobileShell';
import TopBar from '../../components/navigation/TopBar';
import { LoadingSpinner, EmptyState } from '../../components/layout/LoadingStates';
import { Wrench, Plus, ChevronRight } from 'lucide-react';

export function ProviderServicesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgsRes = await organizationsAPI.getMy();
        const orgs = orgsRes.data || [];
        
        if (orgs.length > 0) {
          const branchesRes = await branchesAPI.getByOrg(orgs[0]._id || orgs[0].id);
          setBranches(branchesRes.data || []);
          
          if (branchesRes.data?.length > 0) {
            setSelectedBranch(branchesRes.data[0]);
            // TODO: Fetch provider services for branch
          }
        }

        // Fetch all available services
        const servicesRes = await servicesAPI.getAll();
        setServices(servicesRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MobileShell isProvider>
        <TopBar title="Мои услуги" showBack={false} />
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell isProvider>
      <TopBar title="Мои услуги" showBack={false} />

      {/* Branch Selector */}
      {branches.length > 0 && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="flex gap-2 overflow-x-auto" style={{ paddingBottom: '0.5rem' }}>
            {branches.map((branch) => (
              <button
                key={branch._id || branch.id}
                className={`btn ${selectedBranch?._id === branch._id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
                onClick={() => setSelectedBranch(branch)}
              >
                {branch.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      <section className="section">
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title" style={{ marginBottom: 0 }}>Доступные услуги</h3>
        </div>

        {services.length > 0 ? (
          <div className="flex flex-col gap-2">
            {services.map((service) => (
              <div 
                key={service._id || service.id}
                className="card card-interactive flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Wrench size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{service.name}</p>
                  {service.category?.name && (
                    <p className="text-xs text-muted">{service.category.name}</p>
                  )}
                </div>
                <ChevronRight size={20} className="text-muted" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Wrench}
            title="Нет услуг"
            description="Добавьте услуги, которые предоставляет ваш сервис"
          />
        )}
      </section>

      {/* Add Service CTA */}
      <section className="section">
        <button className="btn btn-primary">
          <Plus size={20} />
          Добавить услугу
        </button>
        <p className="text-xs text-muted text-center mt-2">
          Функция добавления услуг будет доступна в следующем обновлении
        </p>
      </section>
    </MobileShell>
  );
}

export default ProviderServicesPage;
