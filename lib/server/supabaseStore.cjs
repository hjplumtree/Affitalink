const { createClient } = require("@supabase/supabase-js");

let client;
let testClient;

function parseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required Supabase env: ${name}`);
  }
  return value;
}

function getSupabaseServerKey() {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    requireEnv("SUPABASE_SECRET_KEY")
  );
}

function getClient() {
  if (testClient) return testClient;
  if (client) return client;
  client = createClient(
    requireEnv("SUPABASE_URL"),
    getSupabaseServerKey(),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
  return client;
}

function setSupabaseClientForTests(nextClient) {
  testClient = nextClient;
}

function resetSupabaseClientForTests() {
  testClient = null;
  client = null;
}

function mapConnectorRow(row) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    network: row.network,
    authEncrypted: row.auth_encrypted,
    merchants: [],
    status: row.status,
    syncStatus: row.sync_status,
    lastTestedAt: row.last_tested_at,
    lastSyncAt: row.last_sync_at,
    lastSuccessfulSyncAt: row.last_successful_sync_at,
    lastError: parseJson(row.last_error_json, null),
  };
}

function mapSyncRunRow(row) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    connectorId: row.connector_id,
    network: row.network,
    status: row.status,
    fetchedCount: row.fetched_count,
    normalizedCount: row.normalized_count,
    partialFailures: parseJson(row.partial_failures_json, []),
    requestedFrom: row.requested_from || null,
    requestedTo: row.requested_to || null,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

function mapSnapshotRow(row) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    connectorId: row.connector_id,
    network: row.network,
    logicalKey: row.logical_key,
    merchantId: row.merchant_id,
    merchantName: row.merchant_name,
    title: row.title,
    description: row.description,
    couponCode: row.coupon_code,
    destinationUrl: row.destination_url,
    sourceUrl: row.source_url,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    terms: row.terms || "",
    raw: parseJson(row.raw_json, {}),
    status: row.status,
    lastSeenAt: row.last_seen_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

function assertNoError(result, context) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
}

function connectorToRow(connector) {
  return {
    id: connector.id,
    workspace_id: connector.workspaceId,
    network: connector.network,
    auth_encrypted: connector.authEncrypted || null,
    status: connector.status || "not_connected",
    sync_status: connector.syncStatus || "idle",
    last_tested_at: connector.lastTestedAt || null,
    last_sync_at: connector.lastSyncAt || null,
    last_successful_sync_at: connector.lastSuccessfulSyncAt || null,
    last_error_json: connector.lastError || null,
  };
}

function syncRunToRow(syncRun) {
  return {
    id: syncRun.id,
    workspace_id: syncRun.workspaceId,
    connector_id: syncRun.connectorId,
    network: syncRun.network,
    status: syncRun.status,
    fetched_count: syncRun.fetchedCount,
    normalized_count: syncRun.normalizedCount,
    partial_failures_json: syncRun.partialFailures || [],
    requested_from: syncRun.requestedFrom || null,
    requested_to: syncRun.requestedTo || null,
    created_at: syncRun.createdAt,
    completed_at: syncRun.completedAt,
  };
}

function snapshotToRow(snapshot) {
  const row = {
    id: snapshot.id,
    workspace_id: snapshot.workspaceId,
    connector_id: snapshot.connectorId,
    network: snapshot.network,
    logical_key: snapshot.logicalKey,
    merchant_id: snapshot.merchantId,
    merchant_name: snapshot.merchantName,
    title: snapshot.title,
    description: snapshot.description,
    coupon_code: snapshot.couponCode,
    destination_url: snapshot.destinationUrl,
    source_url: snapshot.sourceUrl,
    starts_at: snapshot.startsAt,
    ends_at: snapshot.endsAt,
    terms: snapshot.terms || "",
    raw_json: snapshot.raw || {},
    status: snapshot.status,
    last_seen_at: snapshot.lastSeenAt || null,
    updated_at: snapshot.updatedAt,
  };
  if (snapshot.createdAt) row.created_at = snapshot.createdAt;
  return row;
}

async function findConnectorByNetwork(workspaceId, network) {
  const supabase = getClient();
  const result = await supabase
    .from("connectors")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("network", network)
    .maybeSingle();
  assertNoError(result, "Could not fetch connector");
  if (!result.data) return null;
  const connector = mapConnectorRow(result.data);
  const selections = await listAdvertiserSelections(connector.id);
  return { ...connector, merchants: selections.length ? selections : connector.merchants };
}

async function listAdvertiserSelections(connectorId) {
  const result = await getClient().from("advertiser_selections").select("*").eq("connector_id", connectorId).order("advertiser_name");
  assertNoError(result, "Could not list advertiser selections");
  return (result.data || []).map((row) => ({ id: row.advertiser_id, name: row.advertiser_name, selected: row.selected }));
}

async function listConnectors(workspaceId) {
  const supabase = getClient();
  const result = await supabase
    .from("connectors")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("network");
  assertNoError(result, "Could not list connectors");
  return Promise.all((result.data || []).map(async (row) => {
    const connector = mapConnectorRow(row);
    const selections = await listAdvertiserSelections(connector.id);
    return { ...connector, merchants: selections.length ? selections : connector.merchants };
  }));
}

async function upsertConnector(connector) {
  const result = await getClient().rpc("save_connector", {
    connector: connectorToRow(connector),
    advertisers: (connector.merchants || []).map((merchant) => ({
      id: String(merchant.id),
      name: merchant.name,
      selected: Boolean(merchant.selected),
    })),
  });
  assertNoError(result, "Could not save connector");
  const saved = Array.isArray(result.data) ? result.data[0] : result.data;
  return saved
    ? { ...mapConnectorRow(saved), merchants: connector.merchants || [] }
    : null;
}

async function replaceAdvertiserSelections(connector) {
  const result = await getClient().rpc("replace_advertiser_selections", {
    target_workspace_id: connector.workspaceId,
    target_connector_id: connector.id,
    target_network: connector.network,
    advertisers: (connector.merchants || []).map((merchant) => ({
      id: String(merchant.id),
      name: merchant.name,
      selected: Boolean(merchant.selected),
    })),
  });
  assertNoError(result, "Could not save advertiser selections");
  return connector;
}

async function listSnapshots({ workspaceId, connectorId, network, status } = {}) {
  const supabase = getClient();
  let query = supabase.from("coupon_snapshots").select("*");
  if (workspaceId) query = query.eq("workspace_id", workspaceId);
  if (connectorId) query = query.eq("connector_id", connectorId);
  if (network) query = query.eq("network", network);
  if (status) query = query.eq("status", status);
  query = query.order("updated_at", { ascending: false });
  const result = await query;
  assertNoError(result, "Could not list snapshots");
  return (result.data || []).map(mapSnapshotRow);
}

async function saveSyncResult({ connector, syncRun, snapshots }) {
  const result = await getClient().rpc("save_sync_result", {
    connector_update: connectorToRow(connector),
    sync_run: syncRunToRow(syncRun),
    coupons: snapshots.map(snapshotToRow),
  });
  assertNoError(result, "Could not save sync result");
}

module.exports = {
  findConnectorByNetwork,
  listConnectors,
  listAdvertiserSelections,
  listSnapshots,
  mapConnectorRow,
  mapSnapshotRow,
  mapSyncRunRow,
  resetSupabaseClientForTests,
  replaceAdvertiserSelections,
  saveSyncResult,
  setSupabaseClientForTests,
  upsertConnector,
};
