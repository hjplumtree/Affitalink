import { benefitContent } from "../../lib/offerRecord.cjs";

// Browser-only integration checks. The temporary test page supplies the real
// browserWorkspace module; never run this on an origin containing user data.
const MARKER = "affitalink.storage-test";
const EXPECTED = "affitalink.storage-test.expected";
const CHECKED_AT = "2026-10-16T09:00:00.000Z";
const coupon = {
  id: "cj:9:source:42", logicalKey: "cj:9:source:42", network: "cj",
  sourceOfferId: "source:42", merchantId: "9", merchantName: "테스트 Shop", title: "Sale",
  description: '한글, "offer"\nsecond line', terms: "Members only", couponCode: "Save-0",
  startsAt: "2026-10-01T00:00:00.000Z", endsAt: "2026-10-31T23:59:59.000Z",
  destinationUrl: "https://example.com/?a=1&b=2", sourceUrl: "https://example.com/source",
  raw: { extra: [0, false, { $: { lang: "ko" }, _: "정보" }] }, fetchedAt: "2026-10-16T10:00:00Z",
};
const run = {
  id: "storage-test-run", network: "cj", status: "partial_failure", fetchedCount: 3, normalizedCount: 1,
  partialFailures: [{ stage: "conversion", message: "Invalid date", raw: { date: "bad", zero: 0 } }],
  excluded: [{ reason: "not_a_benefit", raw: { values: [0, false] } }],
  createdAt: "2026-10-16T10:00:00Z", completedAt: "2026-10-16T10:01:00Z",
};

function assert(value, message) { if (!value) throw new Error(message); }
function guard() { assert(location.hostname === "affitalink-storage.localhost", "Use the isolated test origin"); }
async function openDatabase(version) {
  return new Promise((resolve, reject) => {
    const request = version ? indexedDB.open("affitalink", version) : indexedDB.open("affitalink");
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore("coupons", { keyPath: "id" });
      store.createIndex("network", "network");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function writeRows(rows, version) {
  const db = await openDatabase(version);
  return new Promise((resolve, reject) => {
    const tx = db.transaction("coupons", "readwrite");
    rows.forEach((row) => tx.objectStore("coupons").put(row));
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

export async function runBrowserStorageChecks(workspace) {
  guard();
  assert(!(await indexedDB.databases()).some((db) => db.name === "affitalink"), "Existing database: do not overwrite");
  assert(!localStorage.getItem("affitalink.browser.workspace.v1"), "Existing settings: do not overwrite");
  localStorage.setItem(MARKER, "owned");
  const passed = [];
  const legacy = { ...coupon };
  delete legacy.sourceOfferId;
  await writeRows([legacy], 1);
  let [saved] = await workspace.listBrowserCoupons();
  assert(saved.sourceOfferId === "source:42" && saved.checked === false && saved.checkedAt === null, "Legacy defaults / identity");
  assert(JSON.stringify(saved.raw) === JSON.stringify(coupon.raw), "Legacy raw preservation");
  passed.push("PASS: IndexedDB v1 → v2, existing row and source ID preserved");

  const merchants = [{ id: "9", name: "Selected", selected: true }, { id: "10", name: "Not selected", selected: false }];
  workspace.saveBrowserConnector("cj", { status: "connected", merchants });
  await workspace.saveBrowserCoupons([coupon], [run]);
  [saved] = await workspace.listBrowserCoupons();
  for (const field of Object.keys(coupon)) assert(JSON.stringify(saved[field]) === JSON.stringify(coupon[field]), `Round trip: ${field}`);
  assert(JSON.stringify(await workspace.listBrowserSyncRuns("cj")) === JSON.stringify([run]), "Outcome raw round trip");
  passed.push("PASS: all fields, nested raw, 0/false, line breaks, failure and exclusion records");

  await writeRows([{ ...saved, checked: true, checkedAt: CHECKED_AT }]);
  const refreshed = { ...coupon, fetchedAt: "2026-10-17T10:00:00Z", raw: { changedMetadata: [0, false] } };
  await workspace.saveBrowserCoupons([refreshed]);
  [saved] = await workspace.listBrowserCoupons();
  assert(saved.checked && saved.checkedAt === CHECKED_AT, "Metadata must not clear check");
  passed.push("PASS: recollection preserves the check and its original time");

  for (const field of ["merchantName", "title", "description", "terms", "couponCode", "destinationUrl", "startsAt", "endsAt"]) {
    await writeRows([{ ...coupon, checked: true, checkedAt: CHECKED_AT }]);
    await workspace.saveBrowserCoupons([{ ...coupon, [field]: field.endsWith("At") ? "2026-10-15T00:00:00Z" : "Changed" }]);
    [saved] = await workspace.listBrowserCoupons();
    assert(saved.checked === false && saved.checkedAt === null, `Changed ${field} must clear check`);
  }
  passed.push("PASS: each changed benefit detail resets both check fields");

  await writeRows([{ ...coupon, checked: true, checkedAt: CHECKED_AT }]);
  await Promise.all([
    workspace.saveBrowserCoupons([{ ...coupon, raw: { concurrent: 1 } }]),
    workspace.saveBrowserCoupons([{ ...coupon, raw: { concurrent: 2 } }]),
  ]);
  const before = await workspace.listBrowserCoupons();
  assert(before.length === 1 && before[0].checked && before[0].checkedAt === CHECKED_AT, "Concurrent upserts");
  passed.push("PASS: concurrent saves keep one row and preserve the check");

  let failed = false;
  const beforeHistory = await workspace.listBrowserSyncRuns();
  const beforeSettings = workspace.getBrowserWorkspaceSummary();
  try {
    await workspace.saveBrowserCoupons([
      { ...coupon, title: "Must roll back" },
      { ...coupon, id: "invalid", raw: { cannotClone: () => {} } },
    ], [{ ...run, id: "must-not-save" }]);
  } catch { failed = true; }
  assert(failed, "Storage error must reject");
  assert(JSON.stringify(await workspace.listBrowserCoupons()) === JSON.stringify(before), "Coupon rollback");
  assert(JSON.stringify(await workspace.listBrowserSyncRuns()) === JSON.stringify(beforeHistory), "History rollback");
  assert(JSON.stringify(workspace.getBrowserWorkspaceSummary()) === JSON.stringify(beforeSettings), "No success timestamp after rollback");
  passed.push("PASS: storage failure rolls back links and history together");

  await workspace.saveBrowserCoupons([], [{ ...run, id: "failed-fetch", status: "failed", normalizedCount: 0 }]);
  assert(JSON.stringify(await workspace.listBrowserCoupons()) === JSON.stringify(before), "Missing / invalid items must not delete links");
  assert(JSON.stringify(workspace.getBrowserConnector("cj").merchants) === JSON.stringify(merchants), "Selections must survive saves");
  passed.push("PASS: failed/empty collection preserves existing links and advertiser choices");

  [saved] = await workspace.listBrowserCoupons();
  const input = { id: saved.id, checked: false, expected: benefitContent(saved) };
  const unchecked = await workspace.setBrowserCouponChecked(input);
  assert(!unchecked.checked && unchecked.checkedAt === null, "Uncheck clears timestamp");
  const beforeCheck = Date.now();
  const checked = await workspace.setBrowserCouponChecked({ ...input, checked: true });
  assert(checked.checked && Date.parse(checked.checkedAt) >= beforeCheck, "Check records current local time");
  assert(JSON.stringify({ ...checked, checked: unchecked.checked, checkedAt: unchecked.checkedAt }) === JSON.stringify(unchecked), "Only check fields change");
  passed.push("PASS: manual check/uncheck saves local time and only changes check fields");

  await workspace.saveBrowserCoupons([{ ...coupon, terms: "Changed after load" }]);
  failed = false;
  try { await workspace.setBrowserCouponChecked({ ...input, checked: true }); }
  catch (error) { failed = error.statusCode === 409; }
  assert(failed, "Stale check must conflict");
  [saved] = await workspace.listBrowserCoupons();
  assert(!saved.checked && saved.checkedAt === null, "Stale check must not affect new content");
  saved = await workspace.setBrowserCouponChecked({ id: saved.id, checked: true, expected: benefitContent(saved) });
  await workspace.saveBrowserCoupons([{ ...saved, raw: { metadata: "only" } }]);
  assert((await workspace.listBrowserCoupons())[0].checkedAt === saved.checkedAt, "Recollection must keep the manually saved time");
  passed.push("PASS: stale checks are rejected; fresh checks and recollection retain the right time");
  sessionStorage.setItem(EXPECTED, JSON.stringify({ coupons: await workspace.listBrowserCoupons(), runs: await workspace.listBrowserSyncRuns() }));
  return passed.join("\n");
}

export async function checkBrowserReload(workspace) {
  guard();
  const expected = JSON.parse(sessionStorage.getItem(EXPECTED));
  assert(expected, "Run checks before reloading");
  assert(JSON.stringify(await workspace.listBrowserCoupons()) === JSON.stringify(expected.coupons), "Reloaded links differ");
  assert(JSON.stringify(await workspace.listBrowserSyncRuns()) === JSON.stringify(expected.runs), "Reloaded history differs");
  return "PASS: full reload preserves fields, raw data, check/time and failure/exclusion records";
}

export async function cleanBrowserTestData() {
  guard();
  assert(localStorage.getItem(MARKER) === "owned", "Not test-owned data");
  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase("affitalink");
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });
  localStorage.removeItem("affitalink.browser.workspace.v1");
  localStorage.removeItem(MARKER);
  sessionStorage.removeItem(EXPECTED);
  return "Test data removed";
}
