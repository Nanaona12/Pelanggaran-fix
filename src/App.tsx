import React, { ReactNode, useEffect } from 'react';
import {
  BrowserRouter as Router, // Menggunakan Router sebagai alias untuk BrowserRouter
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

// ✅ Import RoleBasedRedirector dari lokasi yang benar
import RoleBasedRedirector from './components/RoleBasedRedirector'; // Asumsi RoleBasedRedirector.tsx ada di src/components/

// Pages (Pastikan semua path ini benar sesuai struktur folder kamu)
import LoginPage from './pages/LoginPage';
import AddViolation from './pages/AddViolation';
import EditViolation from './pages/EditViolation';
import Monitoring from './pages/Monitoring';
import Reports from './pages/Reports';
import StudentData from './pages/StudentData';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';

// ✅ Import komponen Dashboard spesifik role dari lokasi yang benar
import AdminDashboard from './pages/AdminDashboard'; // Asumsi AdminDashboard.tsx ada di src/pages/
import GuruBKDashboard from './pages/GuruBKDashboard'; // Asumsi GuruBKDashboard.tsx ada di src/pages/
import WaliKelasDashboard from './pages/WaliKelasDashboard'; // Asumsi WaliKelasDashboard.tsx ada di src/pages/

// Layout (Pastikan path ini benar)
import Layout from './components/Layout'; // Asumsi Layout.tsx ada di src/components/
import { AuthProvider, useAuth } from './contexts/AuthContext';

const queryClient = new QueryClient();

// Komponen PrivateRoute
interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Log untuk debugging PrivateRoute
  console.log('PrivateRoute: --- EVALUATING ---');
  console.log(
    'PrivateRoute: User:',
    user ? user.email : 'null',
    'Loading:',
    loading
  );

  useEffect(() => {
    // Hanya jalankan setelah AuthContext selesai loading
    if (!loading) {
      if (!user) {
        // Jika tidak ada user setelah loading selesai, redirect ke login
        console.log('PrivateRoute: User NOT logged in, redirecting to /login.');
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate]); // Dependensi useEffect

  // Selama loading, tampilkan pesan loading
  if (loading) {
    console.log('PrivateRoute: Still loading auth status...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Memuat...</p>
      </div>
    );
  }

  // Jika user ada, render children. Jika tidak, render null (useEffect akan redirect)
  return user ? <>{children}</> : null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          {' '}
          {/* Membungkus seluruh aplikasi dengan AuthProvider */}
          <Router>
            {' '}
            {/* Router utama aplikasi */}
            <Routes>
              {' '}
              {/* Definisi semua rute */}
              {/* Redirect dari root '/' ke '/dashboard' */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              {/* Rute untuk halaman Login (tidak dilindungi) */}
              <Route path="/login" element={<LoginPage />} />
              {/* Rute perantara '/dashboard' yang akan mengarahkan user ke dashboard spesifik role */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    {' '}
                    {/* Dilindungi oleh PrivateRoute */}
                    <RoleBasedRedirector />{' '}
                    {/* Komponen yang akan melakukan redirect berdasarkan role */}
                  </PrivateRoute>
                }
              />
              {/* Rute-rute untuk Admin */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    {' '}
                    {/* Dilindungi oleh PrivateRoute */}
                    <Layout />{' '}
                    {/* Menggunakan komponen Layout sebagai wrapper */}
                  </PrivateRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="add-violation" element={<AddViolation />} />
                <Route path="edit-violation/:id" element={<EditViolation />} />
                <Route path="monitoring" element={<Monitoring />} />
                <Route path="reports" element={<Reports />} />
                <Route path="students" element={<StudentData />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              {/* Rute-rute untuk Guru BK */}
              <Route
                path="/guru"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route path="dashboard" element={<GuruBKDashboard />} />
                <Route path="add-violation" element={<AddViolation />} />
                <Route path="monitoring" element={<Monitoring />} />
                <Route path="students" element={<StudentData />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              {/* Rute-rute untuk Wali Kelas */}
              <Route
                path="/wali-kelas"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route path="dashboard" element={<WaliKelasDashboard />} />
                <Route path="students" element={<StudentData />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              {/* Rute fallback untuk 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
