import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowRight, KeyRound, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading, clientError } = useAuth();
  const [mode, setMode] = useState("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const next = typeof router.query.next === "string" ? router.query.next : "/networks";

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.mode === "sign_up") {
      setMode("sign_up");
    } else if (router.query.mode === "waitlist") {
      setMode("waitlist");
    } else if (router.query.mode === "sign_in") {
      setMode("sign_in");
    }
  }, [router.isReady, router.query.mode]);

  useEffect(() => {
    if (authLoading || !user) return;
    router.replace(next);
  }, [authLoading, user, next, router]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (mode === "waitlist") {
        const response = await fetch("/api/early-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            siteUrl,
            notes,
            source: "login_waitlist",
          }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error?.message || "Could not request access");
        }
        setMessage("Request received. We will reach out when access is available.");
        setEmail("");
        setName("");
        setSiteUrl("");
        setNotes("");
      } else {
        if (!supabase) {
          throw clientError || new Error("Supabase client is unavailable");
        }
        const response =
          mode === "sign_in"
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        if (response.error) {
          throw response.error;
        }

        if (mode === "sign_up") {
          setMessage("Account created. If email confirmation is enabled, verify first.");
        } else {
          router.replace(next);
        }
      }
    } catch (nextError) {
      setError(nextError.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/60 bg-white/95">
        <CardHeader className="space-y-5">
          <Badge className="w-fit">Authentication</Badge>
          <div className="space-y-3">
            <CardTitle className="text-4xl">Sign in to your workspace</CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              Use your account to open the studio, connect sources, review incoming changes, and
              manage the offer library attached to your workspace.
            </CardDescription>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] bg-muted p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ArrowRight className="h-5 w-5" />
              </div>
              <p className="font-semibold">Go straight to the work</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign in and jump back into source setup, review, and library work without local-only state.
              </p>
            </div>
            <div className="rounded-[24px] bg-muted p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="font-semibold">Access stays scoped</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Workspace membership controls which data and actions your account can touch.
              </p>
            </div>
            <div className="rounded-[24px] bg-muted p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <p className="font-semibold">Reviews stay attached</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Offer review actions stay tied to the right workspace instead of a single browser.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-transparent bg-[#11141d] text-white shadow-lift">
          <CardHeader>
            <Badge variant="outline" className="w-fit border-white/15 text-white/70">
              First run
            </Badge>
            <CardTitle className="text-white">The first useful path is simple</CardTitle>
            <CardDescription className="text-white/70">
              You do not need publishing automation to get value. The first loop is sources, review, and library.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="font-semibold">1. Connect a source</p>
              <p className="mt-1 text-sm leading-6 text-white/70">
                Start in source settings and connect the networks you already use.
              </p>
            </div>
            <Separator className="bg-white/10" />
            <div>
              <p className="font-semibold">2. Review incoming changes</p>
              <p className="mt-1 text-sm leading-6 text-white/70">
                Pull changes into one queue so you can see what is worth keeping.
              </p>
            </div>
            <Separator className="bg-white/10" />
            <div>
              <p className="font-semibold">3. Build the library</p>
              <p className="mt-1 text-sm leading-6 text-white/70">
                Keep a cleaner inventory before worrying about downstream publishing.
              </p>
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Current redirect</p>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  After sign-in you will be sent to <span className="font-medium text-white">{next}</span>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/95">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={mode === "sign_in" ? "default" : "outline"}
                onClick={() => setMode("sign_in")}
              >
                Sign in
              </Button>
              <Button
                type="button"
                variant={mode === "sign_up" ? "default" : "outline"}
                onClick={() => setMode("sign_up")}
              >
                Create account
              </Button>
              <Button
                type="button"
                variant={mode === "waitlist" ? "default" : "outline"}
                onClick={() => setMode("waitlist")}
              >
                Early access
              </Button>
            </div>
          <div>
              <CardTitle>
                {mode === "sign_in"
                  ? "Enter workspace"
                  : mode === "sign_up"
                    ? "Create workspace access"
                    : "Request early access"}
              </CardTitle>
              <CardDescription>
                {mode === "sign_in"
                  ? "Use the account already connected to your workspace."
                  : mode === "sign_up"
                    ? "Create a new account. If email confirmation is enabled, you may need to verify first."
                    : "Tell us who you are and what kind of coupon or deal site you run."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {clientError && mode !== "waitlist" ? (
              <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                Supabase auth is not configured for this environment yet. Add
                `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` before using sign in.
              </div>
            ) : null}
            {mode === "waitlist" ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="waitlist-name">
                    Name
                  </label>
                  <Input
                    id="waitlist-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="waitlist-email">
                    Email
                  </label>
                  <Input
                    id="waitlist-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="waitlist-site">
                    Site URL
                  </label>
                  <Input
                    id="waitlist-site"
                    type="url"
                    value={siteUrl}
                    onChange={(event) => setSiteUrl(event.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="waitlist-notes">
                    What do you want help with?
                  </label>
                  <textarea
                    id="waitlist-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    className="min-h-[120px] w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Example: I manage coupon updates across Rakuten and CJ and want one review queue."
                  />
                </div>
              </div>
            ) : (
              <>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
              </>
            )}
            {error ? (
              <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}
            {message ? (
              <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </div>
            ) : null}
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading
                ? "Working..."
                : mode === "sign_in"
                  ? "Enter workspace"
                  : mode === "sign_up"
                    ? "Create account"
                    : "Request early access"}
            </Button>
            <p className="text-sm leading-6 text-muted-foreground">
              {mode === "sign_in"
                ? "Need access first? Use the early access tab."
                : mode === "sign_up"
                  ? "Already have an account? Switch back to sign in."
                  : "Already have an account? Switch back to sign in."}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Just looking around? <Link href="/offers" className="font-semibold text-foreground">Browse the library</Link> first.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
