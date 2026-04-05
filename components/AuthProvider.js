import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/client/supabase";

const AuthContext = createContext(null);
const missingClientError = new Error(
  "Supabase browser client is unavailable. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
);

const fallbackAuthValue = {
  supabase: null,
  session: null,
  user: null,
  loading: true,
  async getAccessToken() {
    return null;
  },
  async signOut() {},
};

export function AuthProvider({ children }) {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientError, setClientError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    try {
      const client = getSupabaseBrowserClient();
      if (!mounted) return undefined;
      setSupabase(client);
      setClientError(null);
    } catch (error) {
      if (!mounted) return undefined;
      setClientError(error instanceof Error ? error : missingClientError);
      setLoading(false);
      return undefined;
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

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
      clientError,
      async getAccessToken() {
        if (!supabase) return null;
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || null;
      },
      async signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    }),
    [clientError, loading, session, supabase]
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
