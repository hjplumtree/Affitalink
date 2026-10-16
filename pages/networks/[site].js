import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Search } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";
import Loading from "../../components/Loading";
import { Cluster, PageHeader, PageShell, Panel, Stack } from "../../components/primitives";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { authFetch } from "../../lib/client/authFetch";
import { getBrowserConnector, getSessionCredentials, removeBrowserConnector, saveBrowserConnector, saveSessionCredentials } from "../../lib/client/browserWorkspace";
import { createEmptyCredentials, getNetwork } from "../../lib/networks";

export default function NetworkSettingsPage() {
  const router = useRouter();
  const networkId = typeof router.query.site === "string" ? router.query.site : "";
  const network = useMemo(() => getNetwork(networkId), [networkId]);
  const { user, loading: authLoading, getAccessToken } = useAuth();
  const [credentials, setCredentials] = useState({});
  const [connector, setConnector] = useState(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingConnector, setLoadingConnector] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [savingSelection, setSavingSelection] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState("");
  const [selectionError, setSelectionError] = useState("");

  useEffect(() => {
    if (!network || authLoading) return;
    let current = true;
    async function loadConnector() {
      setLoadingConnector(true);
      setConnector(null);
      setQuery(""); setError(""); setMessage(""); setSelectionError(""); setSelectionMessage("");
      try {
        setCredentials(getSessionCredentials(networkId) || createEmptyCredentials(networkId));
        if (!user) {
          setConnector(getBrowserConnector(networkId));
          return;
        }
        const response = await authFetch(getAccessToken, `/api/connectors/${networkId}`);
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message || "Could not load network");
        if (current) setConnector(payload.connector);
      } catch (nextError) { if (current) setError(nextError.message); }
      finally { if (current) setLoadingConnector(false); }
    }
    loadConnector();
    return () => { current = false; };
  }, [authLoading, getAccessToken, network, networkId, user]);

  async function connectNetwork(event) {
    event.preventDefault();
    if (network.fields.some((field) => !credentials[field.key]?.trim())) return setError("Fill in every field");
    setLoading(true); setError(""); setMessage("");
    try {
      const response = user
        ? await authFetch(getAccessToken, `/api/connectors/${networkId}/test`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ auth: credentials }) })
        : await fetch(`/api/guest/connectors/${networkId}/test`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ auth: credentials }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Connection failed");
      const previousSelections = new Map((connector?.merchants || []).map((merchant) => [merchant.id, merchant.selected]));
      const nextConnector = user ? payload.connector : {
        network: networkId, status: "connected", lastTestedAt: new Date().toISOString(),
        merchants: (payload.merchants || []).map((merchant) => ({ ...merchant, selected: previousSelections.get(merchant.id) ?? merchant.selected ?? true })),
      };
      if (!user) saveBrowserConnector(networkId, nextConnector);
      saveSessionCredentials(networkId, credentials);
      setConnector(nextConnector);
      setMessage("Connected");
    } catch (nextError) { setError(nextError.message || "Connection failed"); }
    finally { setLoading(false); }
  }

  async function disconnectNetwork() {
    if (!window.confirm(`Disconnect ${network.name}?`)) return;
    setLoading(true); setError(""); setMessage("");
    try {
      if (user) {
        const response = await authFetch(getAccessToken, `/api/connectors/${networkId}`, { method: "DELETE" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message || "Could not disconnect network");
      } else removeBrowserConnector(networkId);
      setConnector(null);
      setCredentials(createEmptyCredentials(networkId));
      setMessage("Disconnected");
    } catch (nextError) { setError(nextError.message); }
    finally { setLoading(false); }
  }

  async function toggleAdvertiser(merchantId) {
    if (savingSelection || loading) return;
    const previous = connector;
    const merchants = connector.merchants.map((merchant) => merchant.id === merchantId ? { ...merchant, selected: !merchant.selected } : merchant);
    setConnector({ ...connector, merchants });
    setSavingSelection(true); setSelectionError(""); setSelectionMessage("");
    try {
      if (user) {
        const response = await authFetch(getAccessToken, `/api/connectors/${networkId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ merchants }) });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message || "Could not save selection");
      } else saveBrowserConnector(networkId, { ...previous, merchants });
      setSelectionMessage("Saved");
    } catch (nextError) {
      setConnector(previous);
      setSelectionError(nextError.message || "Could not save selection");
    } finally { setSavingSelection(false); }
  }

  const advertisers = useMemo(() => (connector?.merchants || [])
    .filter((merchant) => merchant.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name)), [connector, query]);
  const selectedCount = (connector?.merchants || []).filter((merchant) => merchant.selected).length;
  if (!network && router.isReady) return <PageShell><Panel>Network not found. <Link href="/networks" className="underline">Back to networks</Link></Panel></PageShell>;
  if (!network) return null;
  const connected = connector?.status === "connected";

  return (
    <PageShell className="max-w-3xl">
      <Link href="/networks" className="inline-flex items-center gap-2 text-sm font-medium"><ArrowLeft className="h-4 w-4" />Networks</Link>
      <PageHeader title={network.name} action={connected ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium">Connected</span> : null} />
      {authLoading || loadingConnector ? <Panel><p role="status">Loading network…</p></Panel> : <>
        <Panel>
          <form onSubmit={connectNetwork}>
            <Stack>
              {network.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label htmlFor={field.key} className="text-sm font-medium">{field.label}</label>
                  <div className="relative">
                    <Input id={field.key} type={field.secret && !showSecrets ? "password" : "text"} value={credentials[field.key] || ""} disabled={loading} onChange={(event) => setCredentials((current) => ({ ...current, [field.key]: event.target.value }))} className={field.secret ? "pr-11" : ""} />
                    {field.secret ? <button type="button" onClick={() => setShowSecrets((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label={showSecrets ? "Hide secret" : "Show secret"}>{showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button> : null}
                  </div>
                </div>
              ))}
              {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
              {message ? <p role="status" className="text-sm">{message}</p> : null}
              <Cluster>
                <Button type="submit" disabled={loading || savingSelection}>{connected ? "Reconnect" : "Connect"}</Button>
                {connected ? <Button type="button" variant="outline" disabled={loading || savingSelection} onClick={disconnectNetwork}>Disconnect</Button> : null}
              </Cluster>
            </Stack>
          </form>
        </Panel>
        {connected ? <Panel className="p-0">
          <div className="space-y-4 border-b border-border p-5">
            <Cluster className="justify-between">
              <h2 className="text-xl font-semibold">Advertisers</h2>
              <span className="text-sm">{selectedCount} selected</span>
            </Cluster>
            <p className="text-sm">Get links from the advertisers you select.</p>
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><Input aria-label="Search advertisers" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search advertisers" className="pl-9" /></div>
            {selectionError ? <p role="alert" className="text-sm text-red-700">{selectionError}</p> : null}
            {savingSelection || selectionMessage ? <p role="status" className="text-sm">{savingSelection ? "Saving…" : selectionMessage}</p> : null}
          </div>
          <div className="divide-y divide-border">
            {advertisers.map((advertiser) => <label key={advertiser.id} className="flex cursor-pointer items-center gap-3 px-5 py-4 hover:bg-muted/35">
              <input type="checkbox" checked={Boolean(advertiser.selected)} onChange={() => toggleAdvertiser(advertiser.id)} disabled={loading || savingSelection} className="h-4 w-4 rounded border-border accent-[hsl(var(--primary))] disabled:cursor-not-allowed" />
              <span className="font-medium">{advertiser.name}</span>
            </label>)}
            {!advertisers.length ? <p className="p-5 text-sm">{query ? "No advertisers match your search." : "No advertisers found in this network."}</p> : null}
          </div>
        </Panel> : null}
      </>}
      <Loading loading={loading} />
    </PageShell>
  );
}
