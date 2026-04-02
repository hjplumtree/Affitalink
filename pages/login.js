import { useState } from "react";
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
  const { supabase } = useAuth();
  const [mode, setMode] = useState("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const next = typeof router.query.next === "string" ? router.query.next : "/links";

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
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
              Use your account to open offer updates, check source health, and manage the
              affiliate sources attached to your workspace.
            </CardDescription>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] bg-muted p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ArrowRight className="h-5 w-5" />
              </div>
              <p className="font-semibold">Go straight to the work</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign in and jump back into updates, offers, and source settings without local-only state.
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
              Access
            </Badge>
            <CardTitle className="text-white">Auth decides what the dashboard unlocks</CardTitle>
            <CardDescription className="text-white/70">
              Source updates, queue actions, and offer selection are all tied to the signed-in workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="font-semibold">Clear workspace access</p>
              <p className="mt-1 text-sm leading-6 text-white/70">
                Sign in only reveals the workspaces your account belongs to.
              </p>
            </div>
            <Separator className="bg-white/10" />
            <div>
              <p className="font-semibold">No extra admin steps</p>
              <p className="mt-1 text-sm leading-6 text-white/70">
                Once your account is in a workspace, you can get back to reviewing and moving offers.
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
            </div>
            <div>
              <CardTitle>{mode === "sign_in" ? "Enter workspace" : "Create workspace access"}</CardTitle>
              <CardDescription>
                {mode === "sign_in"
                  ? "Use the account already connected to your workspace."
                  : "Create a new account. If email confirmation is enabled, you may need to verify first."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
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
              {loading ? "Working..." : mode === "sign_in" ? "Enter workspace" : "Create account"}
            </Button>
            <p className="text-sm leading-6 text-muted-foreground">
              {mode === "sign_in"
                ? "Need an account? Switch to create account."
                : "Already have an account? Switch back to sign in."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
