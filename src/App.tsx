import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from './context/UserContext';
import { useDisableContextMenu } from './hooks/useDisableContextMenu';
import { useGlobalClickSound } from './hooks/useGlobalClickSound';
import SplashScreen from './pages/SplashScreen';
import VerifyPage from './pages/VerifyPage';
import HomePage from './pages/HomePage';
import EarnPage from './pages/EarnPage';
import ProfilePage from './pages/ProfilePage';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

function AppInner() {
  useDisableContextMenu();
  useGlobalClickSound();

  return (
    <BrowserRouter basename={BASE || '/'}>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <div className="flex flex-col h-screen max-w-[480px] mx-auto overflow-hidden">
                <div className="flex-1 overflow-y-auto pb-20">
                  <HomePage />
                </div>
                <BottomNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/earn"
          element={
            <ProtectedRoute>
              <div className="flex flex-col h-screen max-w-[480px] mx-auto overflow-hidden">
                <div className="flex-1 overflow-y-auto pb-20">
                  <EarnPage />
                </div>
                <BottomNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="flex flex-col h-screen max-w-[480px] mx-auto overflow-hidden">
                <div className="flex-1 overflow-y-auto pb-20">
                  <ProfilePage />
                </div>
                <BottomNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AppInner />
      </UserProvider>
    </QueryClientProvider>
  );
}
