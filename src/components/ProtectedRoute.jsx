import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundAura from './BackgroundAura';

export default function ProtectedRoute({ children, requireAvatar = true }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="relative grid h-screen place-items-center">
        <BackgroundAura />
        <div className="glass rounded-full px-6 py-3 text-sm font-medium text-ink-700">
          Przywracanie sesji...
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  const needsAvatar = user && (!user.avatar || user.avatar < 1);
  if (requireAvatar && needsAvatar && location.pathname !== '/onboarding/avatar') {
    return <Navigate to="/onboarding/avatar" replace />;
  }

  return children;
}
