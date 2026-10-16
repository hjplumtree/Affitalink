import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, ExternalLink, Search } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";
import Loading from "../../components/Loading";
import { Cluster, PageHeader, PageShell, Panel } from "../../components/primitives";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { authFetch } from "../../lib/client/authFetch";
import { getSessionCredentials, listBrowserConnectors, listBrowserCoupons, saveBrowserCoupons, setBrowserCouponChecked } from "../../lib/client/browserWorkspace";
import { benefitContent } from "../../lib/offerRecord.cjs";
import { buildOfferCsv } from "../../lib/offerCsv.cjs";
import { localDateInput as dateInput } from "../../lib/localDate.cjs";
import { NETWORKS } from "../../lib/networks";

const PAGE_SIZE = 50;
const CSV_FIELD_LABELS = {
  network: "Network", merchantName: "Advertiser", title: "Title", description: "Description",
  terms: "Terms", couponCode: "Code", startsAt: "Start date", endsAt: "End date",
  destinationUrl: "Link", checked: "Checked", checkedAt: "Check time",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatCheckedAt(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function collectionProblems(run) {
  const failures = run.partialFailures || [];
  const unreadable = failures.filter((failure) => failure.stage === "conversion").length;
  const messages = [...new Set(failures.filter((failure) => failure.stage !== "conversion").map((failure) => failure.message).filter(Boolean))];
  if (unreadable) messages.push(`${unreadable} ${unreadable === 1 ? "link" : "links"} could not be read.`);
  return messages.join(" ") || "Could not finish collecting links.";
}

export default function LinksPage() {
  const { user, loading: authLoading, getAccessToken } = useAuth();
  const [connectors, setConnectors] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [networkFilter, setNetworkFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState(dateInput());
  const [to, setTo] = useState(dateInput(30));
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingChecks, setSavingChecks] = useState(new Set());
  const [checkErrors, setCheckErrors] = useState({});
  const [exportResult, setExportResult] = useState(null);
  const collecting = useRef(false);
  const pendingChecks = useRef(new Set());

  const loadData = useCallback(async () => {
    if (authLoading) return;
    setLoadingData(true);
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
      if (!couponsResponse.ok) throw new Error(couponsPayload.error?.message || "Could not load links");
      setConnectors(connectorsPayload.connectors || []);
      setCoupons(couponsPayload.offers || []);
    } finally { setLoadingData(false); }
  }, [authLoading, getAccessToken, user]);

  useEffect(() => { loadData().catch((nextError) => setError(nextError.message)); }, [loadData]);

  async function fetchCoupons() {
    if (collecting.current || pendingChecks.current.size) return;
    if (from && to && from > to) return setError("Start date must be before end date");
    const activeConnectors = connectors.filter((connector) => connector.status === "connected" && (networkFilter === "all" || connector.network === networkFilter));
    if (!activeConnectors.length) return setError("Connect a network first");
    collecting.current = true;
    setLoading(true); setError(""); setMessage(""); setCheckErrors({}); setExportResult(null);
    let savedCount = 0;
    let completedCount = 0;
    const problems = [];
    try {
      for (const connector of activeConnectors) {
        const networkName = NETWORKS[connector.network]?.name || connector.network;
        try {
          let response;
          if (user) {
            response = await authFetch(getAccessToken, `/api/sync/${connector.network}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from, to }) });
          } else {
            const credentials = getSessionCredentials(connector.network);
            if (!credentials) throw new Error("Reconnect in Networks to get links.");
            const merchantIds = (connector.merchants || []).filter((merchant) => merchant.selected).map((merchant) => merchant.id);
            response = await fetch(`/api/guest/fetch/${connector.network}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ auth: credentials, merchantIds, from, to }) });
          }
          const payload = await response.json();
          if (!user && payload.syncRun) {
            try { await saveBrowserCoupons(payload.coupons || [], [payload.syncRun]); }
            catch { throw new Error("Could not save links. Try again."); }
          }
          if (!response.ok) throw new Error(payload.error?.message || "Could not get links.");
          const run = payload.syncRun;
          if (!run || !["success", "partial_failure", "failed"].includes(run.status)) throw new Error("Could not read the collection result.");
          savedCount += run.normalizedCount;
          if (run.status === "success") completedCount += 1;
          else problems.push(`${networkName}: ${collectionProblems(run)}`);
        } catch (nextError) {
          problems.push(`${networkName}: ${nextError.message || "Could not get links."}`);
        }
      }
      setPage(1);
      const savedMessage = `${savedCount} ${savedCount === 1 ? "link" : "links"} saved.`;
      setMessage(problems.length
        ? savedCount || completedCount ? `${savedMessage} Collection incomplete.` : "Could not get links."
        : savedCount ? savedMessage : "No links found for these dates.");
      // Always show what actually persisted, even after a later network failed.
      try { await loadData(); }
      catch { problems.push("Could not reload the list. Reload the page to see saved links."); }
      setError(problems.join("\n"));
    } finally { collecting.current = false; setLoading(false); }
  }

  async function changeCheck(coupon, checked) {
    if (collecting.current || pendingChecks.current.size) return;
    setExportResult(null);
    pendingChecks.current.add(coupon.id);
    setSavingChecks(new Set(pendingChecks.current));
    setCheckErrors((previous) => ({ ...previous, [coupon.id]: "" }));
    setCoupons((previous) => previous.map((row) => row.id === coupon.id ? { ...row, checked } : row));
    try {
      const input = { id: coupon.id, checked, expected: benefitContent(coupon) };
      let saved;
      if (user) {
        const response = await authFetch(getAccessToken, "/api/offers", {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
        });
        const payload = await response.json();
        if (!response.ok) throw Object.assign(new Error(payload.error?.message), { statusCode: response.status });
        saved = payload.offer;
      } else {
        saved = await setBrowserCouponChecked(input);
      }
      setCoupons((previous) => previous.map((row) => row.id === coupon.id ? saved : row));
    } catch (nextError) {
      setCoupons((previous) => previous.map((row) => row.id === coupon.id ? { ...row, checked: coupon.checked, checkedAt: coupon.checkedAt } : row));
      setCheckErrors((previous) => ({ ...previous, [coupon.id]: nextError.statusCode === 409
        ? "This link changed. Review it and try again."
        : "Could not save check. Try again." }));
      if (nextError.statusCode === 409 || nextError.statusCode === 404) {
        try { await loadData(); } catch { setError("Could not reload the list. Reload the page before checking again."); }
      }
    } finally {
      pendingChecks.current.delete(coupon.id);
      setSavingChecks(new Set(pendingChecks.current));
    }
  }

  const visibleCoupons = useMemo(() => coupons.filter((coupon) => (networkFilter === "all" || coupon.network === networkFilter) && [coupon.title, coupon.description, coupon.merchantName, coupon.couponCode, coupon.terms].join(" ").toLowerCase().includes(query.toLowerCase())).sort((a, b) => new Date(b.updatedAt || b.fetchedAt || 0) - new Date(a.updatedAt || a.fetchedAt || 0)), [coupons, networkFilter, query]);
  const pageCount = Math.max(1, Math.ceil(visibleCoupons.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageCoupons = visibleCoupons.slice(pageStart, pageStart + PAGE_SIZE);
  const pagination = visibleCoupons.length > PAGE_SIZE ? (
    <nav aria-label="Link pages" className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <span>{pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, visibleCoupons.length)} of {visibleCoupons.length} links</span>
      <Cluster>
        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</Button>
        <span aria-live="polite">Page {currentPage} of {pageCount}</span>
        <Button variant="outline" size="sm" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</Button>
      </Cluster>
    </nav>
  ) : null;

  function exportCsv() {
    if (collecting.current || pendingChecks.current.size || loadingData || authLoading || !visibleCoupons.length) return;
    try {
      const { csv, exportedCount, failures } = buildOfferCsv(visibleCoupons);
      if (exportedCount) {
        const link = document.createElement("a");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        link.href = url;
        link.download = `affitalink-links-${dateInput()}.csv`;
        document.body.appendChild(link);
        try { link.click(); } finally {
          link.remove();
          // Allow the browser to start reading the download before releasing it.
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      }
      const reasons = [...new Set(failures.map(({ field, reason }) => `${CSV_FIELD_LABELS[field] || field}: ${reason}`))].join("; ");
      setExportResult({
        error: failures.length > 0,
        text: `${exportedCount} ${exportedCount === 1 ? "link" : "links"} exported.${failures.length ? ` ${failures.length} excluded. ${reasons}.` : ""}`,
      });
    } catch {
      setExportResult({ error: true, text: "Could not create CSV. Try again." });
    }
  }

  const connectedNetworks = connectors.filter((connector) => connector.status === "connected");
  return (
    <PageShell>
      <PageHeader title="Links" />
      <Panel>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <label className="space-y-2 text-sm font-medium"><span>Network</span><select value={networkFilter} onChange={(event) => { setNetworkFilter(event.target.value); setPage(1); setExportResult(null); }} className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm"><option value="all">All networks</option>{connectedNetworks.map((connector) => <option key={connector.network} value={connector.network}>{NETWORKS[connector.network]?.name || connector.network}</option>)}</select></label>
          <label className="space-y-2 text-sm font-medium"><span>Active from</span><Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label className="space-y-2 text-sm font-medium"><span>Active to</span><Input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
          <Button onClick={fetchCoupons} disabled={loading || loadingData || authLoading || savingChecks.size > 0 || !connectedNetworks.length}>{loading ? "Getting links…" : "Get links"}</Button>
        </div>
        {message ? <div role="status" className="mt-4 text-sm">{message}</div> : null}
        {error ? <div role="alert" className="mt-4 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-foreground">{error}</div> : null}
      </Panel>
      <Panel className="p-0">
        <Cluster className="justify-between border-b border-border p-4">
          <div className="relative w-full max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><Input aria-label="Search links" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); setExportResult(null); }} placeholder="Search links" className="pl-9" /></div>
          <Cluster>{!pagination ? <span className="text-sm">{visibleCoupons.length} links</span> : null}<Button variant="outline" size="sm" onClick={exportCsv} disabled={!visibleCoupons.length || loadingData || authLoading || loading || savingChecks.size > 0}><Download className="mr-2 h-4 w-4" />Export CSV</Button></Cluster>
        </Cluster>
        {exportResult ? <p role={exportResult.error ? "alert" : "status"} className="border-b border-border px-4 py-3 text-sm text-foreground">{exportResult.text}</p> : null}
        {pagination}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px] text-left text-sm">
            <thead className="bg-muted/60 text-xs"><tr>{["Checked", "Network", "Advertiser", "Title", "Description", "Terms", "Code", "Start", "End", "Link"].map((heading) => <th key={heading} scope="col" className="px-4 py-3 font-semibold">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {!loadingData && !authLoading ? pageCoupons.map((coupon) => <tr key={coupon.id || coupon.logicalKey} className="align-top hover:bg-muted/30">
                <td className="min-w-[140px] max-w-[200px] px-4 py-4">
                  <Input type="checkbox" checked={Boolean(coupon.checked)} onChange={(event) => changeCheck(coupon, event.target.checked)} disabled={loading || savingChecks.size > 0} aria-label={`Checked: ${coupon.title || coupon.couponCode || coupon.merchantName}`} aria-describedby={checkErrors[coupon.id] ? `check-error-${coupon.id}` : undefined} className="h-4 w-4 cursor-pointer rounded accent-primary shadow-none" />
                  {savingChecks.has(coupon.id) ? <span role="status" className="mt-2 block text-xs">Saving…</span> : coupon.checkedAt ? <time dateTime={coupon.checkedAt} className="mt-2 block text-xs">{formatCheckedAt(coupon.checkedAt)}</time> : null}
                  {checkErrors[coupon.id] ? <div id={`check-error-${coupon.id}`} role="alert" className="mt-2 text-xs">{checkErrors[coupon.id]}</div> : null}
                </td>
                <td className="px-4 py-4 font-mono text-xs uppercase">{coupon.network}</td><td className="max-w-[180px] px-4 py-4 font-medium">{coupon.merchantName}</td><td className="max-w-[220px] px-4 py-4 font-medium">{coupon.title}</td><td className="max-w-[300px] px-4 py-4 text-foreground">{coupon.description || "—"}</td><td className="max-w-[220px] px-4 py-4 text-foreground">{coupon.terms || "—"}</td><td className="px-4 py-4"><span className="rounded bg-accent px-2 py-1 font-mono text-xs font-semibold text-accent-foreground">{coupon.couponCode || "No code"}</span></td><td className="whitespace-nowrap px-4 py-4 text-foreground">{formatDate(coupon.startsAt)}</td><td className="whitespace-nowrap px-4 py-4 text-foreground">{formatDate(coupon.endsAt)}</td><td className="px-4 py-4">{coupon.destinationUrl ? <a href={coupon.destinationUrl} target="_blank" rel="noreferrer" aria-label={`Open ${coupon.title}`} className="text-primary"><ExternalLink className="h-4 w-4" /></a> : "—"}</td>
              </tr>) : null}
              {loadingData || authLoading ? <tr><td colSpan="10" className="px-5 py-12 text-center" role="status">Loading links…</td></tr> : !visibleCoupons.length ? <tr><td colSpan="10" className="px-5 py-12 text-center">{query || networkFilter !== "all" ? "No links match your search." : connectedNetworks.length ? "No links yet. Select Get links to start." : <Link href="/networks" className="font-medium underline">Connect a network to get started.</Link>}</td></tr> : null}
            </tbody>
          </table>
        </div>
        {pagination ? <div className="border-t border-border">{pagination}</div> : null}
      </Panel>
      <Loading loading={loading} />
    </PageShell>
  );
}
