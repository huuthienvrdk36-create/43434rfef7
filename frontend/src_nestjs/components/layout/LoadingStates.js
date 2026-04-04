// Loading Spinner
export function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]}`} data-testid="loading-spinner" />
  );
}

// Loading Overlay
export function LoadingOverlay() {
  return (
    <div className="loading-overlay" data-testid="loading-overlay">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state" data-testid="empty-state">
      {Icon && <Icon size={64} />}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export default LoadingSpinner;
