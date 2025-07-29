import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils'; // Pastikan path util cn sudah benar
import {
  Home,
  PlusSquare,
  Clipboard,
  BarChart,
  Users,
  User,
  Bell,
} from 'lucide-react'; // ✅ Perbaiki import icon (PlusSquare, Clipboard, BarChart)
import { useAuth } from '@/contexts/AuthContext';

// Definisikan semua item navigasi yang mungkin, beserta role yang diizinkan
const allNavigationItems = [
  {
    name: 'Dashboard',
    icon: Home,
    roles: ['admin', 'guru_bk'],
    getHref: (currentRole: string) => {
      if (currentRole === 'admin') return '/admin/dashboard';
      if (currentRole === 'guru_bk') return '/guru/dashboard';
      return '/dashboard'; // Fallback
    },
  },
  {
    name: 'Tambah Pelanggaran',
    icon: PlusSquare,
    roles: ['guru_bk'],
    getHref: (currentRole: string) => '/guru/add-violation',
  },
  {
    name: 'Monitoring',
    icon: Clipboard,
    roles: ['admin', 'guru_bk'],
    getHref: (currentRole: string) => '/guru/monitoring',
  },
  {
    name: 'Laporan',
    icon: BarChart,
    roles: ['admin'],
    getHref: (currentRole: string) => '/admin/reports',
  },
  {
    name: 'Data Siswa',
    icon: Users,
    roles: ['admin', 'guru_bk', 'wali_kelas'],
    getHref: (currentRole: string) => {
      if (currentRole === 'wali_kelas') return '/wali-kelas/students';
      if (currentRole === 'admin' || currentRole === 'guru_bk')
        return '/guru/students';
      return '/dashboard/students'; // Fallback
    },
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, role, loading: authLoading } = useAuth();
  const sidebarClasses = 'hidden md:flex md:w-64 md:flex-col flex-shrink-0';
  const contentWrapperClasses =
    'flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-slate-200';
  const logoWrapperClasses = 'flex items-center flex-shrink-0 px-6';
  const navClasses = 'mt-8 flex-grow flex flex-col';
  const navLinkClasses =
    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors';
  const iconClasses = 'mr-3 h-5 w-5 flex-shrink-0';

  // Tampilkan loading state jika AuthContext belum siap
  if (authLoading) {
    return (
      <div className={sidebarClasses}>
        <div className={contentWrapperClasses}>
          <div className={logoWrapperClasses}>
            <div className="w-10 h-10">
              <img
                src="/logosmp1pwk.png"
                alt="Logo SMP"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <span className="ml-3 text-lg font-semibold text-slate-900">
              Memuat Menu...
            </span>
          </div>
        </div>
      </div>
    );
  }
  if (!user || !role) {
    return (
      <div className={sidebarClasses}>
        <div className={contentWrapperClasses}>
          <div className={logoWrapperClasses}>
            <div className="w-10 h-10">
              <img
                src="/logosmp1pwk.png"
                alt="Logo SMP"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <span className="ml-3 text-lg font-semibold text-slate-900">
              Akses Dibatasi
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Filter item navigasi berdasarkan role user
  const filteredNavigation = allNavigationItems
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      href: item.getHref(role), // Dapatkan href yang spesifik role
    }));

  return (
    <div className={sidebarClasses}>
      <div className={contentWrapperClasses}>
        <div className={logoWrapperClasses}>
          <div className="w-10 h-10">
            <img
              src="/logosmp1pwk.png"
              alt="Logo SMP"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <span className="ml-3 text-lg font-semibold text-slate-900">
            Sistem Pelanggaran
          </span>
        </div>
        <div className={navClasses}>
          <nav className="flex-1 px-4 space-y-2">
            {' '}
            {/* Padding horizontal di sini */}
            {filteredNavigation.map((item) => {
              // Cek apakah link aktif. Gunakan startsWith untuk nested routes
              // Misal: location.pathname /guru/add-violation cocok dengan item.href /guru
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    navLinkClasses,
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      iconClasses,
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
