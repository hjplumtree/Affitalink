const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createFakeSupabaseClient } = require("./support/fakeSupabaseClient.cjs");

function bootstrapStore(workspaceId = "workspace_default") {
  ["../lib/server/dataStore.cjs", "../lib/server/supabaseStore.cjs", "../lib/server/crypto.cjs", "../lib/server/connectors.cjs", "../lib/server/syncEngine.cjs"].forEach((modulePath) => delete require.cache[require.resolve(modulePath)]);
  const store = createFakeSupabaseClient({ workspaces: [{ id: workspaceId, name: "Test" }] });
  require("../lib/server/dataStore.cjs").setSupabaseClientForTests(store);
  return store;
}

test("coupon identity stays stable when the title changes", () => {
  bootstrapStore();
  const { normalizeOffer } = require("../lib/server/syncEngine.cjs");
  const base = { sourceOfferId: "42", merchantId: "9", merchantName: "Shop", title: "First title" };
  assert.equal(normalizeOffer("cj", base).logicalKey, normalizeOffer("cj", { ...base, title: "New title" }).logicalKey);
});

test("stored object IDs keep the full UUID", () => {
  bootstrapStore();
  const { createId } = require("../lib/server/dataStore.cjs");
  assert.match(createId("sync"), /^sync_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("date filtering keeps coupons active during the selected range", () => {
  bootstrapStore();
  const { isCouponInRange } = require("../lib/server/syncEngine.cjs");
  assert.equal(isCouponInRange({ startsAt: "2026-09-10", endsAt: "2026-09-30" }, "2026-09-20", "2026-09-25"), true);
  assert.equal(isCouponInRange({ startsAt: "2026-10-01", endsAt: "2026-10-30" }, "2026-09-20", "2026-09-25"), false);
  assert.equal(isCouponInRange({ startsAt: "", endsAt: "" }, "2026-09-20", "2026-09-25"), true);
});

test("provider duplicates collapse to one coupon before saving", async () => {
  bootstrapStore();
  const { fetchNormalizedCoupons } = require("../lib/server/syncEngine.cjs");
  const coupon = { sourceOfferId: "same", merchantId: "9", merchantName: "Shop", title: "Offer" };
  const result = await fetchNormalizedCoupons(
    "testnet",
    {},
    ["9"],
    { offerFetcher: async () => [coupon, { ...coupon, title: "Latest offer" }] }
  );
  assert.equal(result.fetchedCount, 2);
  assert.equal(result.coupons.length, 1);
  assert.equal(result.coupons[0].title, "Latest offer");
});

test("login redirects stay inside Affitalink", () => {
  const { getSafeInternalPath } = require("../lib/safeRedirect.cjs");
  assert.equal(getSafeInternalPath("/coupons?network=cj"), "/coupons?network=cj");
  assert.equal(getSafeInternalPath("https://example.com"), "/");
  assert.equal(getSafeInternalPath("//example.com"), "/");
  assert.equal(getSafeInternalPath("/\\example.com"), "/");
});

test("connector writes reject unknown networks before storage", async () => {
  bootstrapStore();
  const { saveMerchants } = require("../lib/server/connectors.cjs");
  await assert.rejects(() => saveMerchants("unknown", []), /Unsupported connector/);
});

test("sync updates coupons without marking unseen records missing", async () => {
  const store = bootstrapStore();
  const { connectAndFetchMerchants } = require("../lib/server/connectors.cjs");
  const { runManualSync } = require("../lib/server/syncEngine.cjs");
  await connectAndFetchMerchants("testnet", { test_token_77777: "77777", test_sid_77777: "77777" });
  const coupon = { sourceOfferId: "one", merchantId: "13816", merchantName: "Shop", title: "Offer", description: "", couponCode: "SAVE", destinationUrl: "", sourceUrl: "", startsAt: "", endsAt: "", raw: {} };
  await runManualSync("testnet", { fetchOffers: async () => [coupon] });
  await runManualSync("testnet", { fetchOffers: async () => [] });
  assert.equal(store.dump().coupon_snapshots[0].status, "active");
});

test("repeated sync updates one stable coupon row", async () => {
  const store = bootstrapStore();
  const { connectAndFetchMerchants } = require("../lib/server/connectors.cjs");
  const { runManualSync } = require("../lib/server/syncEngine.cjs");
  await connectAndFetchMerchants("testnet", { test_token_77777: "77777", test_sid_77777: "77777" });
  const coupon = { sourceOfferId: "stable", merchantId: "13816", merchantName: "Shop", title: "First title", raw: {} };
  await runManualSync("testnet", { fetchOffers: async () => [coupon] });
  const firstId = store.dump().coupon_snapshots[0].id;
  await runManualSync("testnet", { fetchOffers: async () => [{ ...coupon, title: "Updated title" }] });
  const saved = store.dump().coupon_snapshots;
  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, firstId);
  assert.equal(saved[0].title, "Updated title");
});

test("sync uses the requested workspace for every stored coupon", async () => {
  const store = bootstrapStore("workspace_team");
  const { connectAndFetchMerchants } = require("../lib/server/connectors.cjs");
  const { runManualSync } = require("../lib/server/syncEngine.cjs");
  await connectAndFetchMerchants("testnet", { test_token_77777: "77777", test_sid_77777: "77777" }, { workspaceId: "workspace_team" });
  await runManualSync("testnet", { workspaceId: "workspace_team" });
  assert.ok(store.dump().coupon_snapshots.every((coupon) => coupon.workspace_id === "workspace_team"));
});

test("auth provider avoids eager Supabase client creation at module load", () => {
  const source = fs.readFileSync(path.join(__dirname, "../components/AuthProvider.js"), "utf8");
  assert.equal(source.includes("const fallbackSupabase = getSupabaseBrowserClient();"), false);
  assert.match(source, /useEffect\(\(\) => \{\s+if \(typeof window === "undefined"\) return;/);
});

test("production encryption requires a stable configured secret", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousSecret = process.env.AFFITALINK_SECRET;
  try {
    process.env.NODE_ENV = "production";
    delete process.env.AFFITALINK_SECRET;
    delete require.cache[require.resolve("../lib/server/crypto.cjs")];
    const { encryptObject } = require("../lib/server/crypto.cjs");
    assert.throws(() => encryptObject({ token: "secret" }), /AFFITALINK_SECRET is required/);
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousSecret === undefined) delete process.env.AFFITALINK_SECRET;
    else process.env.AFFITALINK_SECRET = previousSecret;
    delete require.cache[require.resolve("../lib/server/crypto.cjs")];
  }
});
