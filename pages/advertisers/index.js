import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";
import Loading from "../../components/Loading";
import { PageHeader, PageShell, Panel } from "../../components/primitives";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { authFetch } from "../../lib/client/authFetch";
import { listBrowserConnectors, saveBrowserConnector } from "../../lib/client/browserWorkspace";
import { NETWORKS } from "../../lib/networks";

export default function AdvertisersPage() {
  const { user, loading: authLoading, getAccessToken } = useAuth();
  const [connectors, setConnectors] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadConnectors = useCallback(async () => {
    if (authLoading) return;
    try {
      if (!user) return setConnectors(listBrowserConnectors());
      const response = await authFetch(getAccessToken, "/api/connectors");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Could not load advertisers");
      setConnectors(payload.connectors || []);
    } catch (nextError) { setError(nextError.message); }
  }, [authLoading, getAccessToken, user]);

  useEffect(() => { loadConnectors(); }, [loadConnectors]);

  const advertisers = useMemo(() => connectors.flatMap((connector) => (connector.merchants || []).map((merchant) => ({ ...merchant, network: connector.network }))).filter((merchant) => merchant.name.toLowerCase().includes(query.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)), [connectors, query]);
  const selectedCount = connectors.flatMap((connector) => connector.merchants || []).filter((merchant) => merchant.selected).length;

  async function toggleAdvertiser(network, merchantId) {
    const currentConnector = connectors.find((connector) => connector.network === network);
    const merchants = currentConnector.merchants.map((merchant) => merchant.id === merchantId ? { ...merchant, selected: !merchant.selected } : merchant);
    const nextConnectors = connectors.map((connector) => connector.network === network ? { ...connector, merchants } : connector);
    setConnectors(nextConnectors);
    try {
      if (user) {
        const response = await authFetch(getAccessToken, `/api/connectors/${network}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ merchants }) });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message || "Could not save advertiser");
      } else saveBrowserConnector(network, { ...currentConnector, merchants });
    } catch (nextError) {
      setConnectors(connectors);
      setError(nextError.message);
    }
  }

  const connected = connectors.filter((connector) => connector.status === "connected");
  return (
    <PageShell>
      <PageHeader eyebrow="Selection" title="Advertisers" description={`${selectedCount} advertisers will be included when you fetch coupons.`} action={<Link href="/coupons"><Button>View coupons</Button></Link>} />
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {connected.length ? (
        <Panel className="p-0">
          <div className="border-b border-border p-4"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search advertisers" className="pl-9" /></div></div>
          <div className="divide-y divide-border">
            {advertisers.map((advertiser) => (
              <label key={`${advertiser.network}:${advertiser.id}`} className="flex cursor-pointer items-center gap-4 px-5 py-4 hover:bg-muted/35">
                <input type="checkbox" checked={Boolean(advertiser.selected)} onChange={() => toggleAdvertiser(advertiser.network, advertiser.id)} className="h-4 w-4 rounded border-border accent-[hsl(var(--primary))]" />
                <div className="min-w-0"><p className="font-medium text-foreground">{advertiser.name}</p><p className="mt-0.5 font-mono text-xs text-muted-foreground">{NETWORKS[advertiser.network]?.shortName || advertiser.network} · {advertiser.id}</p></div>
              </label>
            ))}
            {!advertisers.length ? <p className="p-6 text-sm text-muted-foreground">No advertisers match your search.</p> : null}
          </div>
        </Panel>
      ) : (
        <Panel><p className="font-semibold">Connect a network first</p><p className="mt-2 text-sm text-muted-foreground">Advertisers load when a network connection works.</p><Link href="/networks"><Button className="mt-5">Open networks</Button></Link></Panel>
      )}
      <Loading loading={loading} />
    </PageShell>
  );
}
