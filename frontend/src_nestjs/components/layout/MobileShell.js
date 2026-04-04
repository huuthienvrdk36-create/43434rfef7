// Mobile Shell - основной layout приложения
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../navigation/BottomNav';

export function MobileShell({ children, hideNav = false, isProvider = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-detect provider mode from URL
  const isProviderMode = isProvider || location.pathname.startsWith('/provider');

  const handleCreateClick = () => {
    if (isProviderMode) {
      // Provider: go to quotes
      navigate('/provider/quotes');
    } else {
      // Customer: create quote
      navigate('/quotes/create');
    }
  };

  return (
    <div className="mobile-shell" data-testid="mobile-shell">
      <main className="mobile-content">
        {children}
      </main>
      {!hideNav && <BottomNav onCreateClick={handleCreateClick} isProvider={isProviderMode} />}
    </div>
  );
}

export default MobileShell;
