import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ⏩ Auto-redirect jika sudah login
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      console.log('[Login] Supabase response:', { data, signInError });
      if (signInError) throw signInError;

      // AuthContext akan menangani redirect melalui useEffect
    } catch (err: any) {
      console.error('[Login] Error:', err);
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-md rounded-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
            <img src="/logosmp1pwk.png" alt="Logo SMP" className="w-full h-full object-cover" />
          </div>

          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Sistem Pelanggaran Siswa
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              Masuk untuk mengakses sistem pencatatan pelanggaran
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan kata sandi Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Memuat...' : 'Masuk'}
            </Button>
            <div className="text-center">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Lupa kata sandi?
              </a>
            </div>
            {/* <div className="text-center text-sm text-slate-600">
              Belum punya akun?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Daftar
              </Link>
            </div> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
