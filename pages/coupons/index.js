import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Search } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";
import Loading from "../../components/Loading";
import { Cluster, PageHeader, PageShell, Panel } from "../../components/primitives";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { authFetch } from "../../lib/client/authFetch";
import { getSessionCredentials, listBrowserConnectors, listBrowserCoupons, saveBrowserCoupons } from "../../lib/client/browserWorkspace";
import { NETWORKS } from "../../lib/networks";

function dateInput(daysFromToday = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function CouponsPage() {
  const { user, loading: authLoading, getAccessToken } = useAuth();
  const [connectors, setConnectors] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [networkFilter, setNetworkFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState(dateInput());
  const [to, setTo] = useState(dateInput(30));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (authLoading) return;
    try {
      if (!user) {
        setConnectors(listBrowserConnectors());
        setCoupons(await listBrowserCoupons());
        return;
      }
      const [connectorsResponse, couponsResponse] = await Promise.all([authFetch(getAccessToken, "/api/connectors"), authFetch(getAccessToken, "/api/offers")]);
      const connectorsPayload = await connectorsResponse.json();
      const couponsPayload = await couponsResponse.json();
      if (!connectorsResponse.ok) throw new Error(connectorsPayload.error?.message || "Could not load networks");
      if (!couponsResponse.ok) throw new Error(couponsPayload.error?.message || "Could not load coupons");
      setConnectors(connectorsPayload.connectors || []);
      setCoupons(couponsPayload.offers || []);
    } catch (nextError) { setError(nextError.message); }
  }, [authLoading, getAccessToken, user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function fetchCoupons() {
    if (from && to && from > to) return setError("Start date must be before end date");
    const activeConnectors = connectors.filter((connector) => connector.status === "connected" && (networkFilter === "all" || connector.network === networkFilter));
    if (!activeConnectors.length) return setError("Connect a network first");
    setLoading(true); setError(""); setMessage("");
    try {
      if (user) {
        for (const connector of activeConnectors) {
          const response = await authFetch(getAccessToken, `/api/sync/${connector.network}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from, to }) });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error?.message || `Could not fetch ${connector.network}`);
        }
        await loadData();
      } else {
        const fetchedCoupons = [];
        for (const connector of activeConnectors) {
          const credentials = getSessionCredentials(connector.network);
          if (!credentials) throw new Error(`Reconnect ${NETWORKS[connector.network]?.name || connector.network}. Its credentials left this tab.`);
          const merchantIds = (connector.merchants || []).filter((merchant) => merchant.selected).map((merchant) => merchant.id);
          const response = await fetch(`/api/guest/fetch/${connector.network}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ auth: credentials, merchantIds, from, to }) });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error?.message || `Could not fetch ${connector.network}`);
          fetchedCoupons.push(...(payload.coupons || []));
        }
        await saveBrowserCoupons(fetchedCoupons);
        setCoupons(await listBrowserCoupons());
      }
      setMessage(`Coupons fetched and saved ${user ? "to your workspace" : "in this browser"}.`);
    } catch (nextError) { setError(nextError.message || "Could not fetch coupons"); }
    finally { setLoading(false); }
  }

  const visibleCoupons = useMemo(() => coupons.filter((coupon) => (networkFilter === "all" || coupon.network === networkFilter) && [coupon.title, coupon.description, coupon.merchantName, coupon.couponCode, coupon.terms].join(" ").toLowerCase().includes(query.toLowerCase())).sort((a, b) => new Date(b.updatedAt || b.fetchedAt || 0) - new Date(a.updatedAt || a.fetchedAt || 0)), [coupons, networkFilter, query]);

  function exportCsv() {
    const columns = ["network", "merchantName", "title", "description", "terms", "couponCode", "startsAt", "endsAt", "destinationUrl"];
    const escape = (value) => `"${String(value || "").replaceAll('"', '""')}"`;
    const csv = [columns.join(","), ...visibleCoupons.map((coupon) => columns.map((column) => escape(coupon[column])).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `affitalink-coupons-${dateInput()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const connectedNetworks = connectors.filter((connector) => connector.status === "connected");
  return (
    <PageShell>
      <PageHeader eyebrow="Coupon workspace" title="Coupons" description="Choose a date range. Fetch saves the results to the current workspace." />
      <Panel>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <label className="space-y-2 text-sm font-medium"><span>Network</span><select value={networkFilter} onChange={(event) => setNetworkFilter(event.target.value)} className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm"><option value="all">All connected networks</option>{connectedNetworks.map((connector) => <option key={connector.network} value={connector.network}>{NETWORKS[connector.network]?.name || connector.network}</option>)}</select></label>
          <label className="space-y-2 text-sm font-medium"><span>Active from</span><Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label className="space-y-2 text-sm font-medium"><span>Active to</span><Input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
          <Button onClick={fetchCoupons} disabled={loading}>Fetch coupons</Button>
        </div>
        {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {message ? <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
      </Panel>
      <Panel className="p-0">
        <Cluster className="justify-between border-b border-border p-4">
          <div className="relative w-full max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search coupons" className="pl-9" /></div>
          <Cluster><span className="text-sm text-muted-foreground">{visibleCoupons.length} coupons</span><Button variant="outline" size="sm" onClick={exportCsv} disabled={!visibleCoupons.length}><Download className="mr-2 h-4 w-4" />CSV</Button></Cluster>
        </Cluster>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-muted/60 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground"><tr>{["Network", "Advertiser", "Title", "Description", "Terms", "Code", "Start", "End", "Link"].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {visibleCoupons.map((coupon) => <tr key={coupon.id || coupon.logicalKey} className="align-top hover:bg-muted/30">
                <td className="px-4 py-4 font-mono text-xs uppercase">{coupon.network}</td><td className="max-w-[180px] px-4 py-4 font-medium">{coupon.merchantName}</td><td className="max-w-[220px] px-4 py-4 font-medium">{coupon.title}</td><td className="max-w-[300px] px-4 py-4 text-muted-foreground">{coupon.description || "—"}</td><td className="max-w-[220px] px-4 py-4 text-muted-foreground">{coupon.terms || "—"}</td><td className="px-4 py-4"><span className="rounded bg-accent px-2 py-1 font-mono text-xs font-semibold text-accent-foreground">{coupon.couponCode || "No code"}</span></td><td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{formatDate(coupon.startsAt)}</td><td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{formatDate(coupon.endsAt)}</td><td className="px-4 py-4">{coupon.destinationUrl ? <a href={coupon.destinationUrl} target="_blank" rel="noreferrer" aria-label={`Open ${coupon.title}`} className="text-primary"><ExternalLink className="h-4 w-4" /></a> : "—"}</td>
              </tr>)}
              {!visibleCoupons.length ? <tr><td colSpan="9" className="px-5 py-12 text-center text-muted-foreground">No saved coupons. Choose a range and fetch.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Panel>
      <Loading loading={loading} />
    </PageShell>
  );
}
