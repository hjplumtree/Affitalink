const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const { createFakeSupabaseClient } = require("./support/fakeSupabaseClient.cjs");

const MODULES = [
  "../lib/server/dataStore.cjs", "../lib/server/supabaseStore.cjs", "../lib/server/crypto.cjs",
  "../lib/server/connectors.cjs", "../lib/server/syncEngine.cjs", "../lib/server/requestAuth.cjs",
  "../lib/appShells.js", "../pages/api/connectors/index.js", "../pages/api/connectors/[network].js",
  "../pages/api/connectors/[network]/test.js", "../pages/api/offers/index.js", "../pages/api/sync/[network].js",
  "../pages/api/guest/connectors/[network]/test.js", "../pages/api/guest/fetch/[network].js",
];

function freshModules() {
  MODULES.forEach((modulePath) => delete require.cache[require.resolve(modulePath)]);
}

function bootstrapStore() {
  freshModules();
  const { setSupabaseClientForTests } = require("../lib/server/dataStore.cjs");
  const { setRequestContextResolverForTests } = require("../lib/server/requestAuth.cjs");
  setSupabaseClientForTests(createFakeSupabaseClient({ workspaces: [{ id: "workspace_test", name: "Test" }] }));
  setRequestContextResolverForTests(() => ({ user: { id: "user_test" }, workspaceId: "workspace_test" }));
}

function loadApiHandler(modulePath) {
  const filename = require.resolve(modulePath);
  const source = fs.readFileSync(filename, "utf8").replace(/export default async function handler/, "module.exports = async function handler").replace(/export default function handler/, "module.exports = function handler");
  const module = { exports: {} };
  vm.runInNewContext(source, { module, exports: module.exports, require: createRequire(filename), __dirname: path.dirname(filename), __filename: filename, process, console, Buffer, structuredClone, setTimeout, clearTimeout, fetch }, { filename });
  return module.exports;
}

async function runHandler(handler, req) {
  const response = { statusCode: 200, payload: null, status(code) { this.statusCode = code; return this; }, json(body) { this.payload = body; return this; } };
  await handler(req, response);
  return response;
}

test("workspace flow connects, selects, fetches, and never returns credentials", async () => {
  bootstrapStore();
  const testConnection = await runHandler(loadApiHandler("../pages/api/connectors/[network]/test.js"), {
    method: "POST", query: { network: "testnet" }, body: { auth: { test_token_77777: "77777", test_sid_77777: "77777" } },
  });
  assert.equal(testConnection.statusCode, 200);
  assert.equal(testConnection.payload.connector.hasCredentials, true);
  assert.equal("auth" in testConnection.payload.connector, false);

  const merchants = testConnection.payload.connector.merchants.map((merchant, index) => ({ ...merchant, selected: index === 0 }));
  const saveSelection = await runHandler(loadApiHandler("../pages/api/connectors/[network].js"), { method: "PUT", query: { network: "testnet" }, body: { merchants } });
  assert.equal(saveSelection.statusCode, 200);
  assert.equal(saveSelection.payload.connector.merchants.filter((merchant) => merchant.selected).length, 1);

  const sync = await runHandler(loadApiHandler("../pages/api/sync/[network].js"), { method: "POST", query: { network: "testnet" }, body: { from: "2020-01-01", to: "2035-01-01" } });
  assert.equal(sync.statusCode, 200);
  assert.equal(sync.payload.syncRun.normalizedCount, 1);

  const offers = await runHandler(loadApiHandler("../pages/api/offers/index.js"), { method: "GET", query: {} });
  assert.equal(offers.statusCode, 200);
  assert.ok(offers.payload.offers.length > 0);

  const connectors = await runHandler(loadApiHandler("../pages/api/connectors/index.js"), { method: "GET", query: {} });
  assert.equal(connectors.payload.connectors[0].hasCredentials, true);
  assert.equal("auth" in connectors.payload.connectors[0], false);
});

test("guest fetch returns coupons without writing a workspace", async () => {
  bootstrapStore();
  const response = await runHandler(loadApiHandler("../pages/api/guest/fetch/[network].js"), {
    method: "POST", query: { network: "testnet" }, body: {
      auth: { test_token_77777: "77777", test_sid_77777: "77777" }, merchantIds: ["13816"], from: "2020-01-01", to: "2035-01-01",
    },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.coupons.length, 1);
  assert.match(response.payload.coupons[0].id, /^testnet:/);
});

test("invalid fetch dates fail before coupons are saved", async () => {
  bootstrapStore();
  await runHandler(loadApiHandler("../pages/api/connectors/[network]/test.js"), {
    method: "POST", query: { network: "testnet" }, body: { auth: { test_token_77777: "77777", test_sid_77777: "77777" } },
  });
  const response = await runHandler(loadApiHandler("../pages/api/sync/[network].js"), {
    method: "POST", query: { network: "testnet" }, body: { from: "2026-02-31", to: "2026-03-10" },
  });
  assert.equal(response.statusCode, 400);
  const offers = await runHandler(loadApiHandler("../pages/api/offers/index.js"), { method: "GET", query: {} });
  assert.equal(offers.payload.offers.length, 0);
});

test("unauthenticated requests cannot change connector settings", async () => {
  bootstrapStore();
  const { setRequestContextResolverForTests } = require("../lib/server/requestAuth.cjs");
  setRequestContextResolverForTests(() => {
    const error = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  });
  const response = await runHandler(loadApiHandler("../pages/api/connectors/[network]/test.js"), {
    method: "POST", query: { network: "testnet" }, body: { auth: { test_token_77777: "77777", test_sid_77777: "77777" } },
  });
  assert.equal(response.statusCode, 401);
});

test("dashboard is the product entry point and login is the only public shell", () => {
  freshModules();
  const { getShellForPath } = require("../lib/appShells.js");
  assert.equal(getShellForPath("/"), "dashboard");
  assert.equal(getShellForPath("/login"), "public");
  assert.equal(getShellForPath("/coupons"), "dashboard");
});
