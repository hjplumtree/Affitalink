import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/client/supabase";

const AuthContext = createContext(null);
const fallbackSupabase = getSupabaseBrowserClient();
const fallbackAuthValue = {
  supabase: fallbackSupabase,
  session: null,
  user: null,
  loading: false,
  async getAccessToken() {
    const { data } = await fallbackSupabase.auth.getSession();
    return data.session?.access_token || null;
  },
  async signOut() {},
};

export function AuthProvider({ children }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession || null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(
    () => ({
      supabase,
      session,
      user: session?.user || null,
      loading,
      async getAccessToken() {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || null;
      },
      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [loading, session, supabase]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  return value || fallbackAuthValue;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
