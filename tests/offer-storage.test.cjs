const test = require("node:test");
const assert = require("node:assert/strict");
const { readOfferRecord, sameBenefitContent } = require("../lib/offerRecord.cjs");
const { createFakeSupabaseClient } = require("./support/fakeSupabaseClient.cjs");

function bootstrapStore(initialState = {}) {
  for (const name of ["dataStore", "supabaseStore", "connectors", "syncEngine"]) {
    delete require.cache[require.resolve(`../lib/server/${name}.cjs`)];
  }
  const store = createFakeSupabaseClient(initialState);
  require("../lib/server/dataStore.cjs").setSupabaseClientForTests(store);
  return store;
}

const auth = { test_token_77777: "77777", test_sid_77777: "77777" };
const offer = {
  sourceOfferId: "source:42", merchantId: "13816", merchantName: "Shop", title: "Sale",
  description: '한글, "offer"\nsecond line', terms: "Members only", couponCode: "Save-0",
  startsAt: "2026-10-01T00:00:00.000Z", endsAt: "2026-10-31T23:59:59.000Z",
  destinationUrl: "https://example.com/?a=1&b=2", sourceUrl: "https://example.com/source",
  raw: { extra: [0, false, { $: { lang: "ko" }, _: "정보" }], terms: "Do not remap this" },
};
function batch(offers, extra = {}) {
  return { offers, failures: [], excluded: [], fetchedCount: offers.length, ...extra };
}

test("legacy rows recover the full source ID and default to unchecked", () => {
  const row = readOfferRecord({ network: "cj", merchantId: "9", logicalKey: "cj:9:group:42", raw: { list: [0, false] } });
  assert.equal(row.sourceOfferId, "group:42");
  assert.equal(row.checked, false);
  assert.equal(row.checkedAt, null);
  assert.deepEqual(row.raw, { list: [0, false] });
  assert.equal(readOfferRecord({ network: "cj", merchantId: "9", id: "unrelated" }).sourceOfferId, "");
});

test("check comparison ignores metadata and equivalent date spellings, but includes each benefit detail", () => {
  const previous = { ...offer, network: "cj", fetchedAt: "2026-10-15", checked: true, checkedAt: "2026-10-15" };
  assert.equal(sameBenefitContent(previous, { ...previous, fetchedAt: "2026-10-16", raw: { other: 0 }, sourceUrl: "elsewhere", startsAt: "2026-10-01T09:00:00+09:00" }), true);
  for (const field of ["network", "merchantId", "merchantName", "title", "description", "terms", "couponCode", "destinationUrl", "startsAt", "endsAt"]) {
    assert.equal(sameBenefitContent(previous, { ...previous, [field]: field.endsWith("At") ? "2026-10-15T00:00:00Z" : "changed" }), false, field);
  }
});

test("account save and reread retain every common field, raw source and outcomes without reinterpreting raw terms", async () => {
  bootstrapStore();
  const { connectAndFetchMerchants } = require("../lib/server/connectors.cjs");
  const { runManualSync, getOffers } = require("../lib/server/syncEngine.cjs");
  const { listSyncRuns } = require("../lib/server/dataStore.cjs");
  await connectAndFetchMerchants("testnet", auth);
  const failure = { stage: "conversion", type: "validation", message: "Invalid date", raw: { date: "bad", extra: [0, false] } };
  const excluded = { reason: "not_a_benefit", raw: { kind: "ad" } };
  await runManualSync("testnet", { fetchOffers: async () => batch([{ ...offer, terms: "" }], { failures: [failure], excluded: [excluded], fetchedCount: 3 }) });
  const [saved] = await getOffers();
  for (const field of Object.keys(offer)) assert.deepEqual(saved[field], field === "terms" ? "" : offer[field], field);
  assert.equal(saved.checked, false);
  assert.equal(saved.checkedAt, null);
  assert.ok(saved.lastSeenAt);
  assert.ok(saved.createdAt);
  const [run] = await listSyncRuns({ workspaceId: "workspace_default" });
  assert.equal(run.status, "partial_failure");
  assert.deepEqual(run.partialFailures, [failure]);
  assert.deepEqual(run.excluded, [excluded]);
});

test("unchanged recollection keeps the check, changed details reset it and failed conversion cannot overwrite it", async () => {
  const store = bootstrapStore();
  const { connectAndFetchMerchants } = require("../lib/server/connectors.cjs");
  const { runManualSync, getOffers } = require("../lib/server/syncEngine.cjs");
  await connectAndFetchMerchants("testnet", auth);
  await runManualSync("testnet", { fetchOffers: async () => batch([offer]) });
  const [first] = await getOffers();
  const checkedAt = "2026-10-16T09:00:00.000Z";
  await store.from("coupon_snapshots").update({ checked: true, checked_at: checkedAt }).eq("id", first.id);
  await runManualSync("testnet", { fetchOffers: async () => batch([{ ...offer, raw: { updated: [false, 0] } }]) });
  const [same] = await getOffers();
  assert.equal(same.checked, true);
  assert.equal(same.checkedAt, checkedAt);
  assert.equal(same.createdAt, first.createdAt);
  await runManualSync("testnet", { fetchOffers: async () => batch([{ ...offer, startsAt: "bad" }]) });
  assert.deepEqual(await getOffers(), [same]);
  await runManualSync("testnet", { fetchOffers: async () => batch([{ ...offer, couponCode: "New" }]) });
  const saved = await getOffers();
  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, first.id);
  assert.equal(saved[0].checked, false);
  assert.equal(saved[0].checkedAt, null);
});

test("storage errors propagate once without replacing a fetched run with a false zero-item result", async () => {
  const store = bootstrapStore();
  const { connectAndFetchMerchants } = require("../lib/server/connectors.cjs");
  const { runManualSync } = require("../lib/server/syncEngine.cjs");
  await connectAndFetchMerchants("testnet", auth);
  const originalRpc = store.rpc;
  const writes = [];
  store.rpc = (name, args) => {
    if (name !== "save_sync_result") return originalRpc(name, args);
    writes.push(args);
    return Promise.resolve({ data: null, error: { message: "Storage unavailable" } });
  };
  await assert.rejects(runManualSync("testnet", { fetchOffers: async () => batch([offer]) }), (error) => error.type === "storage");
  assert.equal(writes.length, 1);
  assert.equal(writes[0].sync_run.fetched_count, 1);
  assert.equal(store.dump().coupon_snapshots.length, 0);
});

test("account reread loads beyond one Supabase page and keeps workspace boundaries", async () => {
  const rows = Array.from({ length: 2001 }, (_, index) => ({
    id: String(index).padStart(5, "0"), workspace_id: "owner", network: "cj", status: "active",
    merchant_id: "9", logical_key: `cj:9:${index}`, raw_json: { index }, updated_at: "2026-10-16",
  }));
  bootstrapStore({ coupon_snapshots: [...rows, { ...rows[0], id: "other", workspace_id: "other" }] });
  const { getOffers } = require("../lib/server/syncEngine.cjs");
  const saved = await getOffers({ workspaceId: "owner" });
  assert.equal(saved.length, 2001);
  assert.equal(new Set(saved.map((row) => row.id)).size, 2001);
  assert.ok(saved.every((row) => row.workspaceId === "owner"));
});
