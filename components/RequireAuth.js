import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const { user, loading, clientError } = useAuth();

  useEffect(() => {
    if (loading || user || clientError) return;
    router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
  }, [clientError, loading, user, router]);

  if (clientError) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Supabase configuration is missing</p>
            <p className="text-sm text-muted-foreground">
              Studio pages need `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the deployment environment.
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline">Open sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {loading ? "Checking your session..." : "Redirecting to sign in..."}
            </p>
            <p className="text-sm text-muted-foreground">
              Studio pages require an account. If the redirect does not happen, use the button below.
            </p>
          </div>
          {!loading ? (
            <Link href={`/login?next=${encodeURIComponent(router.asPath)}`}>
              <Button variant="outline">Go to sign in</Button>
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return children;
}
