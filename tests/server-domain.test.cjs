const test = require("node:test");
const assert = require("node:assert/strict");
const { createFakeSupabaseClient } = require("./support/fakeSupabaseClient.cjs");

function freshModules() {
  const modules = [
    "../lib/server/dataStore.cjs",
    "../lib/server/supabaseStore.cjs",
    "../lib/server/crypto.cjs",
    "../lib/server/connectors.cjs",
    "../lib/server/syncEngine.cjs",
  ];
  for (const modulePath of modules) {
    delete require.cache[require.resolve(modulePath)];
  }
}

function bootstrapStore() {
  freshModules();
  const { setSupabaseClientForTests } = require("../lib/server/dataStore.cjs");
  setSupabaseClientForTests(
    createFakeSupabaseClient({
      workspaces: [{ id: "workspace_default", name: "Default workspace" }],
    })
  );
}

test("manual sync creates review items for new offers", async () => {
  bootstrapStore();
  const { connectAndFetchMerchants } = require("../lib/server/connectors.cjs");
  const { getReviewItems, runManualSync } = require("../lib/server/syncEngine.cjs");

  await connectAndFetchMerchants("testnet", {
    test_token_77777: "77777",
    test_sid_77777: "77777",
  });
  const syncRun = await runManualSync("testnet");
  const items = await getReviewItems({ network: "testnet" });

  assert.equal(syncRun.status, "success");
  assert.ok(items.length > 0);
  assert.equal(items[0].status, "open");
});

test("manual sync supersedes prior open items when a meaningful change arrives", async () => {
  bootstrapStore();
  const { connectAndFetchMerchants } = require("../lib/server/connectors.cjs");
  const { getReviewItems, runManualSync } = require("../lib/server/syncEngine.cjs");

  await connectAndFetchMerchants("testnet", {
    test_token_77777: "77777",
    test_sid_77777: "77777",
  });

  const firstOffers = [
    {
      sourceOfferId: "offer_1",
      merchantId: "m1",
      merchantName: "Merchant",
      title: "Initial title",
      description: "Desc",
      couponCode: "SAVE10",
      destinationUrl: "https://example.com/a",
      sourceUrl: "https://source.example/a",
      startsAt: "",
      endsAt: "",
      raw: {},
    },
  ];

  await runManualSync("testnet", { fetchOffers: async () => firstOffers });
  const changedOffers = [{ ...firstOffers[0], couponCode: "SAVE20" }];
  await runManualSync("testnet", { fetchOffers: async () => changedOffers });

  const allItems = await getReviewItems({ network: "testnet", status: "" });
  const openItems = allItems.filter((item) => item.status === "open");
  const superseded = allItems.filter((item) => item.status === "superseded");

  assert.equal(openItems.length, 1);
  assert.equal(openItems[0].changeType, "changed");
  assert.equal(superseded.length, 1);
});

test("review item transitions update status explicitly", async () => {
  bootstrapStore();
  const { connectAndFetchMerchants } = require("../lib/server/connectors.cjs");
  const {
    getReviewItems,
    runManualSync,
    updateReviewItemStatus,
  } = require("../lib/server/syncEngine.cjs");

  await connectAndFetchMerchants("testnet", {
    test_token_77777: "77777",
    test_sid_77777: "77777",
  });
  await runManualSync("testnet");
  const item = (await getReviewItems({ network: "testnet" }))[0];
  const approved = await updateReviewItemStatus(item.id, "approve");

  assert.equal(approved.status, "approved");
});
