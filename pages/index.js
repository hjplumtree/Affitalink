import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Building2, Link2, Network } from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { Button } from "../components/ui/button";
import { PageHeader, PageShell, Section } from "../components/primitives";
import { authFetch } from "../lib/client/authFetch";
import { getBrowserWorkspaceSummary, listBrowserCoupons } from "../lib/client/browserWorkspace";

function formatTime(value) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function DashboardPage() {
  const { user, loading: authLoading, getAccessToken } = useAuth();
  const [summary, setSummary] = useState({ connectors: [], coupons: [], lastFetchAt: null });
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (authLoading) return;
    setError("");
    try {
      if (user) {
        const [connectorsResponse, couponsResponse] = await Promise.all([
          authFetch(getAccessToken, "/api/connectors"),
          authFetch(getAccessToken, "/api/offers"),
        ]);
        const connectorsPayload = await connectorsResponse.json();
        const couponsPayload = await couponsResponse.json();
        if (!connectorsResponse.ok) throw new Error(connectorsPayload.error?.message || "Could not load networks");
        if (!couponsResponse.ok) throw new Error(couponsPayload.error?.message || "Could not load links");
        const connectors = connectorsPayload.connectors || [];
        setSummary({ connectors, coupons: couponsPayload.offers || [], lastFetchAt: connectors.map((item) => item.lastSyncAt).filter(Boolean).sort().at(-1) || null });
        return;
      }
      const browserSummary = getBrowserWorkspaceSummary();
      setSummary({ ...browserSummary, coupons: await listBrowserCoupons() });
    } catch (nextError) {
      setError(nextError.message || "Could not load the dashboard");
    }
  }, [authLoading, getAccessToken, user]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  useEffect(() => {
    window.addEventListener("affitalink:workspace-change", loadDashboard);
    return () => window.removeEventListener("affitalink:workspace-change", loadDashboard);
  }, [loadDashboard]);

  const connected = summary.connectors.filter((connector) => connector.status === "connected");
  const selectedAdvertisers = summary.connectors.reduce((total, connector) => total + (connector.merchants || []).filter((merchant) => merchant.selected).length, 0);

  return (
    <PageShell>
      <PageHeader title="Dashboard" action={
        <Link href={connected.length ? "/links" : "/networks"}><Button>{connected.length ? "View links" : "Connect network"}</Button></Link>
      } />
      {error ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <Section>
        <div className="grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-3">
          {[
            { label: "Connected networks", value: connected.length, icon: Network, href: "/networks" },
            { label: "Selected advertisers", value: selectedAdvertisers, icon: Building2, href: "/networks" },
            { label: "Saved links", value: summary.coupons.length, icon: Link2, href: "/links" },
          ].map((item, index) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-4 p-5 hover:bg-muted/45 ${index ? "border-t border-border md:border-l md:border-t-0" : ""}`}>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent"><item.icon className="h-5 w-5" /></div>
              <div><p className="text-2xl font-semibold tabular-nums">{item.value}</p><p className="text-sm">{item.label}</p></div>
            </Link>
          ))}
        </div>
      </Section>
      {summary.lastFetchAt ? <p className="text-sm">Last updated: {formatTime(summary.lastFetchAt)}</p> : null}
    </PageShell>
  );
}
