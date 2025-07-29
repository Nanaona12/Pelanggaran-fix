import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Pastikan path ini benar!
import { useAuth } from '@/contexts/AuthContext';

const AdminGuruBKDashboardContent = () => {
  const { user, role, loading: authLoading } = useAuth();

  // ✅ State untuk menyimpan data statistik dinamis
  const [dynamicStats, setDynamicStats] = useState([
    {
      title: 'Total Pelanggaran',
      value: '...',
      change: '', // Akan diisi dari data
      changeType: 'stable', // Akan diisi dari data
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Siswa Terlibat',
      value: '...',
      change: '', // Akan diisi dari data
      changeType: 'stable', // Akan diisi dari data
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Bulan Ini',
      value: '...',
      change: '', // Akan diisi dari data
      changeType: 'stable', // Akan diisi dari data
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Tren',
      value: 'Stabil',
      change: '±0%',
      changeType: 'stable',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]);

  const [recentViolations, setRecentViolations] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDataLoading(true);
      // Hanya fetch jika user sudah login dan role adalah admin atau guru_bk
      if (!user || authLoading || (role !== 'admin' && role !== 'guru_bk')) {
        setDataLoading(false);
        return;
      }

      try {
        // --- Ambil Data Statistik ---
        // Total Pelanggaran
        const { count: totalViolationsCount, error: totalError } =
          await supabase
            .from('pelanggaran')
            .select('*', { count: 'exact', head: true });

        // Siswa Terlibat (jumlah siswa unik yang memiliki pelanggaran)
        const { data: allNisRecords, error: distinctStudentsError } =
          await supabase.from('pelanggaran').select('nis');

        let uniqueStudentsCount = 0;
        if (!distinctStudentsError && allNisRecords) {
          const uniqueNisSet = new Set(
            allNisRecords.map((record) => record.nis)
          );
          uniqueStudentsCount = uniqueNisSet.size;
        }

        // Pelanggaran Bulan Ini
        const today = new Date();
        const startOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        ).toISOString();
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59
        ).toISOString();

        const { count: currentMonthViolationsCount, error: currentMonthError } =
          await supabase
            .from('pelanggaran')
            .select('*', { count: 'exact', head: true })
            .gte('tanggal', startOfMonth)
            .lte('tanggal', endOfMonth);

        // Update dynamicStats
        setDynamicStats((prev) =>
          prev.map((stat, index) => {
            switch (index) {
              case 0: // Total Pelanggaran
                return {
                  ...stat,
                  value: totalViolationsCount?.toString() || '0',
                  change: totalError ? 'Error' : stat.change, // Tetap gunakan change statis jika tidak ada logika perubahan
                  changeType: totalError ? 'stable' : stat.changeType,
                };
              case 1: // Siswa Terlibat
                return {
                  ...stat,
                  value: uniqueStudentsCount.toString(),
                  change: distinctStudentsError ? 'Error' : stat.change,
                  changeType: distinctStudentsError
                    ? 'stable'
                    : stat.changeType,
                };
              case 2: // Bulan Ini
                return {
                  ...stat,
                  value: currentMonthViolationsCount?.toString() || '0',
                  change: currentMonthError ? 'Error' : stat.change,
                  changeType: currentMonthError ? 'stable' : stat.changeType,
                };
              default:
                return stat;
            }
          })
        );

        // --- Ambil Pelanggaran Terbaru ---
        const { data: recentData, error: recentError } = await supabase
          .from('pelanggaran')
          .select('id, "tipe pelanggaran", tanggal, siswa(nama, kelas)')
          .order('tanggal', { ascending: false })
          .limit(5);

        const formatted =
          recentData?.map((v: any) => ({
            id: v.id,
            student: v.siswa?.nama || 'N/A',
            class: v.siswa?.kelas || 'N/A', // ✅ Perbaikan syntax error di sini
            violation: v['tipe pelanggaran'],
            date: new Date(v.tanggal).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            severity: 'Ringan', // ganti kalau kamu punya field berat/sedang/ringan
          })) || [];

        setRecentViolations(formatted);
      } catch (err) {
        console.error('Dashboard error:', err);
        // Set stats ke 'Error' jika ada kesalahan tak terduga
        setDynamicStats((prev) =>
          prev.map((stat, index) => {
            if (index < 3)
              return {
                ...stat,
                value: 'Error',
                change: 'Error',
                changeType: 'stable',
              };
            return stat;
          })
        );
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, role, authLoading]);

  // Tampilkan loading state jika data autentikasi atau data dashboard masih dimuat
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Memuat dashboard...</p>
      </div>
    );
  }

  // Jika tidak ada user (meskipun PrivateRoute sudah menangani), tampilkan pesan
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Anda belum login.</p>
      </div>
    );
  }

  // Konten ini hanya untuk Admin dan Guru BK
  if (role !== 'admin' && role !== 'guru_bk') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
          <p className="font-bold">Akses Ditolak!</p>
          <p>Anda tidak memiliki izin untuk melihat konten dashboard ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Selamat Datang, <strong>{user.email}</strong>! Anda login sebagai:{' '}
          <span className="font-semibold text-blue-600">
            {role?.toUpperCase() || 'ROLE TIDAK DIKETAHUI'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dynamicStats.map((stat) => (
          <Card key={stat.title} className="border-slate-200 rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stat.value}
                  </p>
                  {/* Hanya tampilkan change jika ada */}
                  {stat.change && (
                    <p
                      className={`text-sm mt-1 ${
                        stat.changeType === 'increase'
                          ? 'text-red-600'
                          : stat.changeType === 'decrease'
                          ? 'text-green-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {stat.change} dari bulan lalu
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pelanggaran Terbaru</CardTitle>
              <CardDescription>
                Pelanggaran terbaru yang tercatat dalam sistem
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-md">
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentViolations.length === 0 ? (
                <p className="text-slate-500 italic">
                  Belum ada data pelanggaran.
                </p>
              ) : (
                recentViolations.map((violation) => (
                  <div
                    key={violation.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {violation.student}
                      </p>
                      <p className="text-sm text-slate-600">
                        {violation.class} • {violation.violation}
                      </p>
                      <p className="text-xs text-slate-500">{violation.date}</p>
                    </div>
                    <Badge
                      variant={
                        violation.severity === 'Berat'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="rounded-full"
                    >
                      {violation.severity}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminGuruBKDashboardContent;
