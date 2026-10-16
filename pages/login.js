import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Panel, Stack } from "../components/primitives";
const { getSafeInternalPath } = require("../lib/safeRedirect.cjs");

export default function LoginPage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading, clientError } = useAuth();
  const [mode, setMode] = useState("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const next = getSafeInternalPath(router.query.next);

  useEffect(() => { if (!authLoading && user) router.replace(next); }, [authLoading, next, router, user]);

  async function submit() {
    setLoading(true); setError(""); setMessage("");
    try {
      if (!supabase) throw clientError || new Error("Sign in is not configured");
      const result = mode === "sign_in" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      if (result.data.session) {
        await router.replace(next);
      } else setMessage("Check your email to finish creating the account.");
    } catch (nextError) { setError(nextError.message || "Could not sign in"); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="py-4 lg:py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
        <h1 className="mt-10 text-4xl font-semibold tracking-[-0.04em]">Your links on any device.</h1>
        <p className="mt-4 text-base leading-7 text-foreground">Sign in or continue without an account.</p>
      </div>
      <Panel className="p-6 lg:p-8">
        <Stack>
          <div className="flex gap-2"><Button variant={mode === "sign_in" ? "default" : "outline"} onClick={() => setMode("sign_in")}>Sign in</Button><Button variant={mode === "sign_up" ? "default" : "outline"} onClick={() => setMode("sign_up")}>Create account</Button></div>
          <label className="space-y-2 text-sm font-medium"><span>Email</span><Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="space-y-2 text-sm font-medium"><span>Password</span><Input type="password" autoComplete={mode === "sign_in" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {clientError ? <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Sign-in is unavailable. You can continue without an account.</div> : null}
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
          <Button className="w-full" onClick={submit} disabled={loading}>{loading ? "Working…" : mode === "sign_in" ? "Sign in" : "Create account"}</Button>
          <Link href="/" className="text-center text-sm font-medium text-foreground hover:text-foreground">Continue without an account</Link>
        </Stack>
      </Panel>
    </div>
  );
}
