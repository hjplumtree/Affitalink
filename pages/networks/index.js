import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, Plug } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";
import { PageHeader, PageShell, Panel } from "../../components/primitives";
import { authFetch } from "../../lib/client/authFetch";
import { listBrowserConnectors } from "../../lib/client/browserWorkspace";
import { NETWORKS } from "../../lib/networks";

export default function NetworksPage() {
  const { user, loading: authLoading, getAccessToken } = useAuth();
  const [connectors, setConnectors] = useState([]);
  const [error, setError] = useState("");

  const loadConnectors = useCallback(async () => {
    if (authLoading) return;
    try {
      if (!user) return setConnectors(listBrowserConnectors());
      const response = await authFetch(getAccessToken, "/api/connectors");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Could not load networks");
      setConnectors(payload.connectors || []);
    } catch (nextError) { setError(nextError.message); }
  }, [authLoading, getAccessToken, user]);

  useEffect(() => { loadConnectors(); }, [loadConnectors]);

  return (
    <PageShell>
      <PageHeader eyebrow="Setup" title="Networks" description="Connect the affiliate networks you already use." />
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <Panel className="p-0">
        {Object.values(NETWORKS).map((network, index) => {
          const connector = connectors.find((item) => item.network === network.id);
          const connected = connector?.status === "connected";
          return (
            <Link key={network.id} href={`/networks/${network.id}`} className={`flex items-center gap-4 p-5 hover:bg-muted/45 ${index ? "border-t border-border" : ""}`}>
              <div className={`grid h-11 w-11 place-items-center rounded-lg ${connected ? "bg-accent text-primary" : "bg-muted text-muted-foreground"}`}>
                {connected ? <Check className="h-5 w-5" /> : <Plug className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{network.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{connected ? `${(connector.merchants || []).length} advertisers loaded` : "Not connected"}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${connected ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>{connected ? "Connected" : "Connect"}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
      </Panel>
      <p className="text-xs text-muted-foreground">{user ? "Credentials are encrypted and stored in your workspace." : "Credentials stay in this tab and clear when you close it."}</p>
    </PageShell>
  );
}
