const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const { createFakeSupabaseClient } = require("./support/fakeSupabaseClient.cjs");

function freshModules() {
  const modules = [
    "../lib/server/dataStore.cjs",
    "../lib/server/supabaseStore.cjs",
    "../lib/server/crypto.cjs",
    "../lib/server/connectors.cjs",
    "../lib/server/syncEngine.cjs",
    "../lib/server/earlyAccessStore.cjs",
    "../lib/appShells.js",
    "../pages/api/connectors/index.js",
    "../pages/api/connectors/[network].js",
    "../pages/api/connectors/[network]/test.js",
    "../pages/api/early-access.js",
    "../pages/api/offers/index.js",
    "../pages/api/offers/[id].js",
    "../pages/api/sync/[network].js",
    "../pages/api/review-items/index.js",
    "../pages/api/review-items/[id].js",
    "../pages/api/health.js",
  ];

  for (const modulePath of modules) {
    delete require.cache[require.resolve(modulePath)];
  }
}

function bootstrapStore() {
  freshModules();
  const { setSupabaseClientForTests } = require("../lib/server/dataStore.cjs");
  const {
    setRequestContextResolverForTests,
  } = require("../lib/server/requestAuth.cjs");
  const {
    resetEarlyAccessInserterForTests,
  } = require("../lib/server/earlyAccessStore.cjs");
  setSupabaseClientForTests(
    createFakeSupabaseClient({
      workspaces: [{ id: "workspace_default", name: "Default workspace" }],
    })
  );
  setRequestContextResolverForTests(() => ({
    user: { id: "user_test" },
    workspaceId: "workspace_default",
    role: "owner",
  }));
  resetEarlyAccessInserterForTests();
}

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

async function runHandler(handler, req) {
  const res = createResponse();
  await handler(req, res);
  return res;
}

function loadApiHandler(modulePath) {
  const filename = require.resolve(modulePath);
  const dirname = path.dirname(filename);
  const source = fs
    .readFileSync(filename, "utf8")
    .replace(/export default async function handler/, "module.exports = async function handler")
    .replace(/export default function handler/, "module.exports = function handler");

  const module = { exports: {} };
  const localRequire = createRequire(filename);
  const sandbox = {
    module,
    exports: module.exports,
    require: localRequire,
    __dirname: dirname,
    __filename: filename,
    process,
    console,
    Buffer,
    structuredClone,
    setTimeout,
    clearTimeout,
    fetch,
  };

  vm.runInNewContext(source, sandbox, { filename });
  return module.exports;
}

test("API workflow covers connector setup, sync, review action, and health summary", async () => {
  bootstrapStore();

  const connectorsIndexHandler = loadApiHandler("../pages/api/connectors/index.js");
  const connectorHandler = loadApiHandler("../pages/api/connectors/[network].js");
  const connectorTestHandler = loadApiHandler("../pages/api/connectors/[network]/test.js");
  const offersHandler = loadApiHandler("../pages/api/offers/index.js");
  const offerHandler = loadApiHandler("../pages/api/offers/[id].js");
  const syncHandler = loadApiHandler("../pages/api/sync/[network].js");
  const reviewItemsHandler = loadApiHandler("../pages/api/review-items/index.js");
  const reviewItemHandler = loadApiHandler("../pages/api/review-items/[id].js");
  const healthHandler = loadApiHandler("../pages/api/health.js");

  const testConnection = await runHandler(connectorTestHandler, {
    method: "POST",
    query: { network: "testnet" },
    body: {
      auth: {
        test_token_77777: "77777",
        test_sid_77777: "77777",
      },
    },
  });

  assert.equal(testConnection.statusCode, 200);
  assert.equal(testConnection.payload.ok, true);
  assert.equal(testConnection.payload.connector.status, "connected");
  assert.ok(testConnection.payload.connector.merchants.length > 0);

  const selectedMerchants = testConnection.payload.connector.merchants.map((merchant, index) => ({
    ...merchant,
    selected: index === 0,
  }));

  const saveMerchants = await runHandler(connectorHandler, {
    method: "PUT",
    query: { network: "testnet" },
    body: { merchants: selectedMerchants },
  });

  assert.equal(saveMerchants.statusCode, 200);
  assert.equal(
    saveMerchants.payload.connector.merchants.filter((merchant) => merchant.selected).length,
    1
  );

  const syncResponse = await runHandler(syncHandler, {
    method: "POST",
    query: { network: "testnet" },
    body: {},
  });

  assert.equal(syncResponse.statusCode, 200);
  assert.equal(syncResponse.payload.ok, true);
  assert.equal(syncResponse.payload.syncRun.status, "success");

  const offersResponse = await runHandler(offersHandler, {
    method: "GET",
    query: {},
  });

  assert.equal(offersResponse.statusCode, 200);
  assert.equal(offersResponse.payload.ok, true);
  assert.ok(offersResponse.payload.offers.length > 0);
  assert.equal(offersResponse.payload.offers[0].network, "testnet");
  assert.equal(offersResponse.payload.offers[0].publishStatus, "draft");

  const reviewItemsResponse = await runHandler(reviewItemsHandler, {
    method: "GET",
    query: { network: "testnet" },
  });

  assert.equal(reviewItemsResponse.statusCode, 200);
  assert.ok(reviewItemsResponse.payload.items.length > 0);
  const firstItem = reviewItemsResponse.payload.items[0];

  const approveResponse = await runHandler(reviewItemHandler, {
    method: "POST",
    query: { id: firstItem.id },
    body: { action: "approve" },
  });

  assert.equal(approveResponse.statusCode, 200);
  assert.equal(approveResponse.payload.item.status, "approved");

  const selectOfferResponse = await runHandler(offerHandler, {
    method: "POST",
    query: { id: offersResponse.payload.offers[0].id },
    body: { action: "select" },
  });

  assert.equal(selectOfferResponse.statusCode, 200);
  assert.equal(selectOfferResponse.payload.offer.publishStatus, "selected");

  const publishOfferResponse = await runHandler(offerHandler, {
    method: "POST",
    query: { id: offersResponse.payload.offers[0].id },
    body: { action: "publish" },
  });

  assert.equal(publishOfferResponse.statusCode, 200);
  assert.equal(publishOfferResponse.payload.offer.publishStatus, "published");

  const publicOffersResponse = await runHandler(offersHandler, {
    method: "GET",
    query: { public: "1" },
  });

  assert.equal(publicOffersResponse.statusCode, 200);
  assert.equal(publicOffersResponse.payload.ok, true);
  assert.equal(publicOffersResponse.payload.offers.length, 1);
  assert.equal(publicOffersResponse.payload.offers[0].publishStatus, "published");

  const healthResponse = await runHandler(healthHandler, {
    method: "GET",
    query: {},
  });

  assert.equal(healthResponse.statusCode, 200);
  assert.equal(healthResponse.payload.ok, true);
  assert.equal(healthResponse.payload.health[0].network, "testnet");
  assert.equal(healthResponse.payload.health[0].syncStatus, "success");

  const connectorsIndexResponse = await runHandler(connectorsIndexHandler, {
    method: "GET",
    query: {},
  });

  assert.equal(connectorsIndexResponse.statusCode, 200);
  assert.equal(connectorsIndexResponse.payload.connectors.length, 1);
});

test("early access API validates email and stores requests", async () => {
  bootstrapStore();

  const storedRequests = [];
  const {
    setEarlyAccessInserterForTests,
  } = require("../lib/server/earlyAccessStore.cjs");
  const earlyAccessHandler = loadApiHandler("../pages/api/early-access.js");

  setEarlyAccessInserterForTests(async (record) => {
    storedRequests.push(record);
    return { ...record, storage: "test" };
  });

  const invalidResponse = await runHandler(earlyAccessHandler, {
    method: "POST",
    body: { email: "not-an-email" },
  });

  assert.equal(invalidResponse.statusCode, 400);
  assert.equal(invalidResponse.payload.ok, false);

  const validResponse = await runHandler(earlyAccessHandler, {
    method: "POST",
    body: {
      email: "owner@example.com",
      name: "Owner",
      siteUrl: "https://example.com",
      notes: "Need one review queue for Rakuten and CJ",
      source: "test_suite",
    },
  });

  assert.equal(validResponse.statusCode, 200);
  assert.equal(validResponse.payload.ok, true);
  assert.equal(storedRequests.length, 1);
  assert.equal(storedRequests[0].email, "owner@example.com");
  assert.equal(storedRequests[0].source, "test_suite");
});

test("app shell resolution keeps landing separate from the dashboard", () => {
  freshModules();
  const { getShellForPath } = require("../lib/appShells.js");

  assert.equal(getShellForPath("/"), "public");
  assert.equal(getShellForPath("/login"), "public");
  assert.equal(getShellForPath("/offers"), "dashboard");
  assert.equal(getShellForPath("/links"), "dashboard");
  assert.equal(getShellForPath("/studio/offers"), "dashboard");
});
