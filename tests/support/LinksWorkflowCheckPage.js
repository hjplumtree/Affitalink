// Temporary entry for the real Links page with fake network replies, on an
// isolated origin. No network credentials or external requests are used.
import { useRef, useState } from "react";
import * as workspace from "../../lib/client/browserWorkspace";

const MARKER = "affitalink.links-test";
const base = {
  merchantId: "9", merchantName: "Sample Shop", description: "20% off selected items",
  terms: "Members only", couponCode: "SAVE20", startsAt: null, endsAt: null,
  destinationUrl: "https://example.com/", sourceUrl: "https://example.com/",
  status: "active", raw: { original: [0, false] },
};
function guard() { if (location.hostname !== "affitalink-storage.localhost") throw new Error("Use the isolated test origin"); }

export default function LinksWorkflowCheckPage() {
  const frame = useRef(null);
  const scenario = useRef("success");
  const failChecks = useRef(false);
  const pendingReply = useRef(null);
  const calls = useRef(0);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Test data only");
  const [saved, setSaved] = useState("");
  const [csv, setCsv] = useState("");
  const [downloads, setDownloads] = useState(0);

  async function prepare() {
    guard();
    if ((await indexedDB.databases()).some((db) => db.name === "affitalink") || localStorage.getItem("affitalink.browser.workspace.v1")) throw new Error("Existing data: refusing to overwrite");
    localStorage.setItem(MARKER, "owned");
    for (const network of ["cj", "rakuten"]) {
      workspace.saveBrowserConnector(network, { status: "connected", merchants: [{ id: "9", name: "Sample Shop", selected: true }] });
      workspace.saveSessionCredentials(network, { fixture: "fake" });
    }
    setReady(true);
    setStatus("Prepared");
  }

  function attach() {
    const child = frame.current.contentWindow;
    const nativeFetch = child.fetch.bind(child);
    child.fetch = async (url, options) => {
      if (!String(url).includes("/api/guest/fetch/")) return nativeFetch(url, options);
      calls.current += 1;
      setStatus(`Requests: ${calls.current}`);
      const network = String(url).split("/").pop();
      const mode = scenario.current;
      if (mode === "delay") await new Promise((resolve) => { pendingReply.current = resolve; });
      const failure = mode === "failure" || (mode === "first-failure" && network === "cj") || (mode === "partial" && network === "rakuten");
      const coupons = failure || mode === "empty" ? [] : Array.from({ length: ["pages", "csv", "csv-errors"].includes(mode) ? 51 : 1 }, (_, index) => ({
        ...base, network, sourceOfferId: `fixture-${index}`, id: `${network}:9:fixture-${index}`,
        logicalKey: `${network}:9:fixture-${index}`, title: `${network.toUpperCase()} offer ${index + 1}`,
        fetchedAt: new Date().toISOString(),
        terms: mode === "changed" ? "New terms" : base.terms,
        ...(mode.startsWith("csv") ? {
          title: mode === "csv-errors" && index < 2 ? `${network.toUpperCase()} invalid ${index}` : `${network.toUpperCase()} offer ${index + 1}`,
          description: '한글, "offer"\r\nSecond line', terms: index === 0 ? base.terms : ["Members, only", "A\nB", 0, false],
          startsAt: "2026-10-01T09:00:00+09:00", endsAt: mode === "csv-errors" && index < 2 ? "bad" : null,
        } : {}),
      }));
      const partialFailures = failure ? [{ stage: "collection", type: "transport", message: "Network unavailable", raw: null }]
        : mode === "partial" ? [{ stage: "conversion", message: "Invalid date", raw: { date: "bad" } }] : [];
      const run = {
        id: crypto.randomUUID(), network, status: failure ? "failed" : partialFailures.length ? "partial_failure" : "success",
        normalizedCount: coupons.length, fetchedCount: coupons.length + partialFailures.length,
        partialFailures, excluded: [], createdAt: new Date().toISOString(), completedAt: new Date().toISOString(),
      };
      return new Response(JSON.stringify({ ok: !failure, coupons, syncRun: run, ...(failure ? { error: { message: "Network unavailable" } } : {}) }), { status: failure ? 502 : 200, headers: { "Content-Type": "application/json" } });
    };
    const put = child.IDBObjectStore.prototype.put;
    child.IDBObjectStore.prototype.put = function (value, ...args) {
      if (this.name === "coupons" && (scenario.current === "storage-failure" || failChecks.current)) throw new DOMException("Test storage failure", "QuotaExceededError");
      return put.call(this, value, ...args);
    };
    // Observe the actual download bytes without replacing the native download.
    const createUrl = child.URL.createObjectURL;
    child.URL.createObjectURL = function (blob) {
      if (blob.type.startsWith("text/csv")) {
        blob.text().then(setCsv);
        setDownloads((count) => count + 1);
      }
      return createUrl.call(this, blob);
    };
    setStatus("Links ready");
  }

  async function inspect() {
    const rows = await workspace.listBrowserCoupons();
    const runs = await workspace.listBrowserSyncRuns();
    setSaved(JSON.stringify({ count: rows.length, checks: rows.filter((row) => row.checked).map(({ id, checkedAt }) => ({ id, checkedAt })), runs: runs.length, requests: calls.current }));
  }
  async function changeBehindPage() {
    const rows = await workspace.listBrowserCoupons();
    await workspace.saveBrowserCoupons(rows.map((row) => ({ ...row, terms: "Changed in another tab" })));
    setStatus("Stored terms changed; visible page still has old details");
  }
  async function clean() {
    guard();
    if (localStorage.getItem(MARKER) !== "owned") throw new Error("Not test-owned");
    setReady(false);
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase("affitalink");
      request.onsuccess = resolve; request.onerror = () => reject(request.error);
    });
    localStorage.removeItem("affitalink.browser.workspace.v1");
    sessionStorage.removeItem("affitalink.session.credentials.v1");
    localStorage.removeItem(MARKER);
    setSaved(""); setCsv(""); setDownloads(0); setStatus("Test data removed");
  }
  return <main>
    <h1>Steps 4–6 workflow checks</h1>
    <button onClick={() => prepare().catch((error) => setStatus(error.message))}>Prepare test</button>{" | "}
    <label>Response <select defaultValue="success" onChange={(event) => { scenario.current = event.target.value; }}>
      {["success", "empty", "partial", "first-failure", "failure", "storage-failure", "changed", "pages", "csv", "csv-errors", "delay"].map((value) => <option key={value}>{value}</option>)}
    </select></label>{" | "}
    <label><input type="checkbox" onChange={(event) => { failChecks.current = event.target.checked; }} />Fail check save</label>{" | "}
    <button onClick={() => { scenario.current = "success"; pendingReply.current?.(); }}>Release request</button>{" | "}
    <button onClick={inspect}>Inspect saved data</button>{" | "}
    <button onClick={changeBehindPage}>Change stored terms</button>{" | "}
    <button onClick={() => frame.current?.contentWindow.location.reload()}>Reload links</button>{" | "}
    <button onClick={clean}>Clean test data</button>
    <p role="status">{status}</p><pre style={{ whiteSpace: "pre-wrap" }}>{saved}</pre>
    {ready ? <iframe ref={frame} src="/links" title="Links under test" onLoad={attach} style={{ width: "100%", height: "760px", border: "1px solid" }} /> : null}
    <p>CSV downloads: {downloads}</p><pre aria-label="Last CSV">{csv}</pre>
  </main>;
}
