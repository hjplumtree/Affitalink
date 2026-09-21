import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Building2, CircleCheck, Network, TicketPercent } from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { Button } from "../components/ui/button";
import { Cluster, PageHeader, PageShell, Panel, Section } from "../components/primitives";
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
        if (!couponsResponse.ok) throw new Error(couponsPayload.error?.message || "Could not load coupons");
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
      <PageHeader eyebrow={user ? "Workspace" : "Browser workspace"} title="Coupon dashboard" description="Your networks, advertiser choices, and saved coupons in one place." action={
        <Link href="/coupons"><Button><TicketPercent className="mr-2 h-4 w-4" />Fetch coupons</Button></Link>
      } />
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <Section className="grid gap-4 md:grid-cols-3">
        <Panel className="md:col-span-2 bg-foreground text-white">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Last fetch</p>
          <p className="mt-3 text-2xl font-semibold">{formatTime(summary.lastFetchAt)}</p>
          <p className="mt-2 text-sm text-white/60">{summary.coupons.length} coupons are saved {user ? "to this workspace" : "in this browser"}.</p>
          <Link href="/coupons" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">Open coupons <ArrowRight className="h-4 w-4" /></Link>
        </Panel>
        <Panel>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Next step</p>
          <p className="mt-3 text-lg font-semibold">{connected.length ? "Fetch current coupons" : "Connect a network"}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{connected.length ? "Use the date range and fetch the advertisers you selected." : "Add the credentials for a network you already use."}</p>
          <Link href={connected.length ? "/coupons" : "/networks"} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">Continue <ArrowRight className="h-4 w-4" /></Link>
        </Panel>
      </Section>
      <Section>
        <div className="grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-3">
          {[
            { label: "Connected networks", value: connected.length, icon: Network, href: "/networks" },
            { label: "Selected advertisers", value: selectedAdvertisers, icon: Building2, href: "/advertisers" },
            { label: "Saved coupons", value: summary.coupons.length, icon: CircleCheck, href: "/coupons" },
          ].map((item, index) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-4 p-5 hover:bg-muted/45 ${index ? "border-t border-border md:border-l md:border-t-0" : ""}`}>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary"><item.icon className="h-5 w-5" /></div>
              <div><p className="text-2xl font-semibold tabular-nums">{item.value}</p><p className="text-sm text-muted-foreground">{item.label}</p></div>
            </Link>
          ))}
        </div>
      </Section>
      {!user ? <Panel className="border-dashed"><Cluster className="justify-between"><div><p className="font-semibold">This works without an account</p><p className="mt-1 text-sm text-muted-foreground">Sign in only when you want the same workspace on another device.</p></div><Link href="/login"><Button variant="outline">Sign in to sync</Button></Link></Cluster></Panel> : null}
    </PageShell>
  );
}
