import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || user) return;
    router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
  }, [loading, user, router]);

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
