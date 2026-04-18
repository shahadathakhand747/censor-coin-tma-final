import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
        <div className="text-white text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user.membership_verified) {
    return <Navigate to="/verify" replace />;
  }

  return <>{children}</>;
}
