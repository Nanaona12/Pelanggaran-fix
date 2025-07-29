// src/components/RoleBasedRedirector.tsx
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleBasedRedirector: React.FC = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Pastikan AuthContext sudah selesai loading dan user serta role sudah ada
    if (!loading && user && role) {
      console.log(
        `RoleBasedRedirector: User ${user.email} with role ${role} detected.`
      );
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'guru_bk':
          navigate('/guru/dashboard', { replace: true });
          break;
        case 'wali_kelas':
          navigate('/wali-kelas/students', { replace: true });
          break;
        default:
          // Fallback jika role tidak dikenal atau belum diatur
          console.warn(
            `RoleBasedRedirector: Unknown role ${role}. Redirecting to generic dashboard.`
          );
          navigate('/dashboard', { replace: true }); // Atau halaman error/default
          break;
      }
    } else if (!loading && !user) {
      // Jika AuthContext selesai loading tapi tidak ada user, redirect ke login
      console.log('RoleBasedRedirector: No user found, redirecting to login.');
      navigate('/login', { replace: true });
    }
  }, [user, role, loading, navigate]); // Dependensi

  // Tampilkan loading screen saat menunggu role terdeteksi
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-lg text-gray-700">Mengarahkan ke dashboard...</p>
    </div>
  );
};

export default RoleBasedRedirector;
