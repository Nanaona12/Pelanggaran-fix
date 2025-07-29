// src/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/supabaseClient';

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  kelasDiampu: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// ❗GANTI dengan user_id dari Wali Kelas di Supabase Auth
const waliKelasToClassMap: { [userId: string]: string } = {
  'a7ab8e15-1d25-439b-80e2-7bd4aefef9ee': '10 IPA 1',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [kelasDiampu, setKelasDiampu] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserRole = async (userId: string): Promise<string | null> => {
    try {
      console.log(`[AuthContext] 🔍 Fetching role for user: ${userId}`);

      const { data: userRolesRaw, error: userRolesError } = await supabase
        .from('user role')
        .select('role_id')
        .eq('user_id', userId);

      if (userRolesError) throw userRolesError;
      if (!userRolesRaw || userRolesRaw.length === 0) return null;

      const roleId = userRolesRaw[0].role_id;

      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('role_name')
        .eq('id', roleId)
        .single();

      if (roleError) throw roleError;

      return roleData?.role_name ?? null;
    } catch (err: any) {
      console.error('[AuthContext] ❌ Error fetching role:', err.message);
      return null;
    }
  };

  const loadSession = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (session?.user) {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData?.user) {
        console.error('[AuthContext] ❌ Error fetching user:', error?.message);
        return;
      }

      setUser(userData.user);

      const fetchedRole = await fetchUserRole(userData.user.id);
      setRole(fetchedRole);

      if (fetchedRole === 'wali_kelas') {
        setKelasDiampu(waliKelasToClassMap[userData.user.id] || null);
      } else {
        setKelasDiampu(null);
      }
    } else {
      setUser(null);
      setRole(null);
      setKelasDiampu(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      console.log('[AuthContext] 🔁 Initializing session...');
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (session?.user) {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData?.user) {
          console.error(
            '[AuthContext] ❌ Failed to get user:',
            userError?.message
          );
          setUser(null);
          setRole(null);
          setKelasDiampu(null);
        } else {
          setUser(userData.user);

          const fetchedRole = await fetchUserRole(userData.user.id);
          setRole(fetchedRole);

          if (fetchedRole === 'wali_kelas') {
            setKelasDiampu(waliKelasToClassMap[userData.user.id] || null);
          } else {
            setKelasDiampu(null);
          }
        }
      } else {
        setUser(null);
        setRole(null);
        setKelasDiampu(null);
      }

      setLoading(false);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] 🔔 Auth state changed:', event);
        await init(); // 🔁 gunakan ulang fungsi init
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, kelasDiampu }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
