import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Trash2 } from "lucide-react";
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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadConnector = useCallback(async () => {
    if (!network || authLoading) return;
    setCredentials(getSessionCredentials(networkId) || createEmptyCredentials(networkId));
    if (!user) return setConnector(getBrowserConnector(networkId));
    try {
      const response = await authFetch(getAccessToken, `/api/connectors/${networkId}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Could not load network");
      setConnector(payload.connector);
    } catch (nextError) { setError(nextError.message); }
  }, [authLoading, getAccessToken, network, networkId, user]);

  useEffect(() => { loadConnector(); }, [loadConnector]);

  async function connectNetwork() {
    if (network.fields.some((field) => !credentials[field.key]?.trim())) return setError("Fill in every field");
    setLoading(true); setError(""); setMessage("");
    try {
      const response = user
        ? await authFetch(getAccessToken, `/api/connectors/${networkId}/test`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ auth: credentials }) })
        : await fetch(`/api/guest/connectors/${networkId}/test`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ auth: credentials }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Connection failed");
      const nextConnector = user ? payload.connector : { network: networkId, status: "connected", merchants: payload.merchants || [], lastTestedAt: new Date().toISOString() };
      if (!user) saveBrowserConnector(networkId, nextConnector);
      saveSessionCredentials(networkId, credentials);
      setConnector(nextConnector);
      setMessage(`${network.name} is connected`);
    } catch (nextError) { setError(nextError.message || "Connection failed"); }
    finally { setLoading(false); }
  }

  async function disconnectNetwork() {
    if (!window.confirm(`Disconnect ${network.name}?`)) return;
    setLoading(true); setError("");
    try {
      if (user) {
        const response = await authFetch(getAccessToken, `/api/connectors/${networkId}`, { method: "DELETE" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message || "Could not disconnect network");
      } else removeBrowserConnector(networkId);
      setConnector(null);
      setCredentials(createEmptyCredentials(networkId));
      setMessage(`${network.name} is disconnected`);
    } catch (nextError) { setError(nextError.message); }
    finally { setLoading(false); }
  }

  if (!network && router.isReady) return <PageShell><Panel>Unknown network.</Panel></PageShell>;
  if (!network) return null;
  const connected = connector?.status === "connected";

  return (
    <PageShell>
      <Link href="/networks" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Networks</Link>
      <PageHeader eyebrow="Network settings" title={network.name} description={connected ? "Update the credentials or test the connection again." : "Enter the API credentials from your network account."} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel>
          <Stack>
            {network.fields.map((field) => (
              <label key={field.key} className="space-y-2 text-sm font-medium">
                <span>{field.label}</span>
                <div className="relative">
                  <Input type={field.secret && !showSecrets ? "password" : "text"} value={credentials[field.key] || ""} placeholder={connected && user ? "Enter a new value to reconnect" : field.label} onChange={(event) => setCredentials((current) => ({ ...current, [field.key]: event.target.value }))} className={field.secret ? "pr-11" : ""} />
                  {field.secret ? <button type="button" onClick={() => setShowSecrets((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showSecrets ? "Hide secret" : "Show secret"}>{showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button> : null}
                </div>
              </label>
            ))}
            {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
            <Cluster>
              <Button onClick={connectNetwork}>{connected ? "Test and update" : "Connect network"}</Button>
              {connected ? <Button variant="outline" onClick={disconnectNetwork}><Trash2 className="mr-2 h-4 w-4" />Disconnect</Button> : null}
            </Cluster>
          </Stack>
        </Panel>
        <Panel className="h-fit bg-muted/50">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Where it saves</p>
          <p className="mt-3 font-semibold">{user ? "Your workspace" : "This browser tab"}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{user ? "Credentials are encrypted on the server. They never return to the browser." : "Credentials clear when this tab closes. Advertiser choices stay in this browser."}</p>
          {connected ? <Link href="/advertisers" className="mt-5 inline-flex text-sm font-semibold text-primary">Choose advertisers →</Link> : null}
        </Panel>
      </div>
      <Loading loading={loading} />
    </PageShell>
  );
}
