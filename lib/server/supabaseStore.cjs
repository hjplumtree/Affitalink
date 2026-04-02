const { createClient } = require("@supabase/supabase-js");

const DEFAULT_STATE = {
  workspaces: [{ id: "workspace_default", name: "Default workspace" }],
  connectors: [],
  syncRuns: [],
  snapshots: [],
  reviewItems: [],
};

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

function nextStateWithDefaults(parsed) {
  return {
    ...DEFAULT_STATE,
    ...parsed,
    workspaces:
      parsed.workspaces && parsed.workspaces.length > 0
        ? parsed.workspaces
        : DEFAULT_STATE.workspaces,
    connectors: parsed.connectors || [],
    syncRuns: parsed.syncRuns || [],
    snapshots: parsed.snapshots || [],
    reviewItems: parsed.reviewItems || [],
  };
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
    merchants: parseJson(row.merchants_json, []),
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
    reviewItemsCreated: row.review_items_created,
    partialFailures: parseJson(row.partial_failures_json, []),
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
    raw: parseJson(row.raw_json, {}),
    status: row.status,
    lastSeenAt: row.last_seen_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

function mapReviewItemRow(row) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    connectorId: row.connector_id,
    logicalKey: row.logical_key,
    merchantId: row.merchant_id,
    merchantName: row.merchant_name,
    title: row.title,
    changeType: row.change_type,
    reason: row.reason,
    confidence: row.confidence,
    status: row.status,
    beforeSnapshot: parseJson(row.before_snapshot_json, null),
    afterSnapshot: parseJson(row.after_snapshot_json, null),
    syncRunId: row.sync_run_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
    merchants_json: JSON.stringify(connector.merchants || []),
    status: connector.status || "not_connected",
    sync_status: connector.syncStatus || "idle",
    last_tested_at: connector.lastTestedAt || null,
    last_sync_at: connector.lastSyncAt || null,
    last_successful_sync_at: connector.lastSuccessfulSyncAt || null,
    last_error_json: connector.lastError ? JSON.stringify(connector.lastError) : null,
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
    review_items_created: syncRun.reviewItemsCreated,
    partial_failures_json: JSON.stringify(syncRun.partialFailures || []),
    created_at: syncRun.createdAt,
    completed_at: syncRun.completedAt,
  };
}

function snapshotToRow(snapshot) {
  return {
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
    raw_json: JSON.stringify(snapshot.raw || {}),
    status: snapshot.status,
    last_seen_at: snapshot.lastSeenAt || null,
    updated_at: snapshot.updatedAt,
    created_at: snapshot.createdAt,
  };
}

function reviewItemToRow(item) {
  return {
    id: item.id,
    workspace_id: item.workspaceId,
    connector_id: item.connectorId,
    logical_key: item.logicalKey,
    merchant_id: item.merchantId,
    merchant_name: item.merchantName,
    title: item.title,
    change_type: item.changeType,
    reason: item.reason,
    confidence: item.confidence,
    status: item.status,
    before_snapshot_json: item.beforeSnapshot ? JSON.stringify(item.beforeSnapshot) : null,
    after_snapshot_json: item.afterSnapshot ? JSON.stringify(item.afterSnapshot) : null,
    sync_run_id: item.syncRunId,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

async function ensureWorkspace(workspace) {
  const supabase = getClient();
  const result = await supabase.from("workspaces").upsert(
    {
      id: workspace.id,
      name: workspace.name,
    },
    { onConflict: "id" }
  );
  assertNoError(result, "Could not ensure workspace");
}

async function findConnectorByNetwork(workspaceId, network) {
  const supabase = getClient();
  await ensureWorkspace({ id: workspaceId, name: "Default workspace" });
  const result = await supabase
    .from("connectors")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("network", network)
    .maybeSingle();
  assertNoError(result, "Could not fetch connector");
  return result.data ? mapConnectorRow(result.data) : null;
}

async function listConnectors(workspaceId) {
  const supabase = getClient();
  await ensureWorkspace({ id: workspaceId, name: "Default workspace" });
  const result = await supabase
    .from("connectors")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("network");
  assertNoError(result, "Could not list connectors");
  return (result.data || []).map(mapConnectorRow);
}

async function upsertConnector(connector) {
  const supabase = getClient();
  await ensureWorkspace({ id: connector.workspaceId, name: "Default workspace" });
  const result = await supabase
    .from("connectors")
    .upsert(connectorToRow(connector), { onConflict: "id" })
    .select()
    .maybeSingle();
  assertNoError(result, "Could not save connector");
  return result.data ? mapConnectorRow(result.data) : null;
}

async function listSnapshotsByConnector(connectorId) {
  const supabase = getClient();
  const result = await supabase
    .from("coupon_snapshots")
    .select("*")
    .eq("connector_id", connectorId);
  assertNoError(result, "Could not list snapshots");
  return (result.data || []).map(mapSnapshotRow);
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

async function upsertSnapshot(snapshot) {
  const supabase = getClient();
  const result = await supabase
    .from("coupon_snapshots")
    .upsert(snapshotToRow(snapshot), { onConflict: "id" })
    .select()
    .maybeSingle();
  assertNoError(result, "Could not save snapshot");
  return result.data ? mapSnapshotRow(result.data) : null;
}

async function insertSyncRun(syncRun) {
  const supabase = getClient();
  const result = await supabase
    .from("sync_runs")
    .insert(syncRunToRow(syncRun))
    .select()
    .maybeSingle();
  assertNoError(result, "Could not insert sync run");
  return result.data ? mapSyncRunRow(result.data) : null;
}

async function listReviewItems({ workspaceId, connectorId, status } = {}) {
  const supabase = getClient();
  let query = supabase.from("review_items").select("*");
  if (workspaceId) query = query.eq("workspace_id", workspaceId);
  if (connectorId) query = query.eq("connector_id", connectorId);
  if (status) query = query.eq("status", status);
  query = query.order("created_at", { ascending: false });
  const result = await query;
  assertNoError(result, "Could not list review items");
  return (result.data || []).map(mapReviewItemRow);
}

async function insertReviewItem(item) {
  const supabase = getClient();
  const result = await supabase
    .from("review_items")
    .insert(reviewItemToRow(item))
    .select()
    .maybeSingle();
  assertNoError(result, "Could not insert review item");
  return result.data ? mapReviewItemRow(result.data) : null;
}

async function supersedeOpenReviewItems(workspaceId, logicalKey, updatedAt) {
  const supabase = getClient();
  const result = await supabase
    .from("review_items")
    .update({ status: "superseded", updated_at: updatedAt })
    .eq("workspace_id", workspaceId)
    .eq("logical_key", logicalKey)
    .eq("status", "open");
  assertNoError(result, "Could not supersede review items");
}

async function updateReviewItemStatusById(id, workspaceId, status, updatedAt) {
  const supabase = getClient();
  let query = supabase
    .from("review_items")
    .update({ status, updated_at: updatedAt })
    .eq("id", id);
  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }
  const result = await query.select().maybeSingle();
  assertNoError(result, "Could not update review item");
  return result.data ? mapReviewItemRow(result.data) : null;
}

async function readState() {
  const supabase = getClient();
  const [workspacesResult, connectorsResult, syncRunsResult, snapshotsResult, reviewItemsResult] =
    await Promise.all([
      supabase.from("workspaces").select("id,name").order("id"),
      supabase.from("connectors").select("*").order("network"),
      supabase.from("sync_runs").select("*").order("created_at", { ascending: false }),
      supabase.from("coupon_snapshots").select("*"),
      supabase.from("review_items").select("*").order("created_at", { ascending: false }),
    ]);

  assertNoError(workspacesResult, "Could not read workspaces");
  assertNoError(connectorsResult, "Could not read connectors");
  assertNoError(syncRunsResult, "Could not read sync runs");
  assertNoError(snapshotsResult, "Could not read snapshots");
  assertNoError(reviewItemsResult, "Could not read review items");

  return nextStateWithDefaults({
    workspaces: (workspacesResult.data || []).map((row) => ({
      id: row.id,
      name: row.name,
    })),
    connectors: (connectorsResult.data || []).map(mapConnectorRow),
    syncRuns: (syncRunsResult.data || []).map(mapSyncRunRow),
    snapshots: (snapshotsResult.data || []).map(mapSnapshotRow),
    reviewItems: (reviewItemsResult.data || []).map(mapReviewItemRow),
  });
}

async function replaceTable(table, rows) {
  const supabase = getClient();
  const deleteResult = await supabase.from(table).delete().neq("id", "__never__");
  assertNoError(deleteResult, `Could not clear ${table}`);

  if (!rows.length) return;
  const insertResult = await supabase.from(table).insert(rows);
  assertNoError(insertResult, `Could not insert ${table}`);
}

async function writeState(mutator) {
  const current = await readState();
  const next = nextStateWithDefaults(mutator(structuredClone(current)) || current);

  await replaceTable(
    "workspaces",
    next.workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
    }))
  );
  await replaceTable(
    "connectors",
    next.connectors.map((connector) => ({
      id: connector.id,
      workspace_id: connector.workspaceId,
      network: connector.network,
      auth_encrypted: connector.authEncrypted || null,
      merchants_json: JSON.stringify(connector.merchants || []),
      status: connector.status || "not_connected",
      sync_status: connector.syncStatus || "idle",
      last_tested_at: connector.lastTestedAt || null,
      last_sync_at: connector.lastSyncAt || null,
      last_successful_sync_at: connector.lastSuccessfulSyncAt || null,
      last_error_json: connector.lastError ? JSON.stringify(connector.lastError) : null,
    }))
  );
  await replaceTable(
    "sync_runs",
    next.syncRuns.map((syncRun) => ({
      id: syncRun.id,
      workspace_id: syncRun.workspaceId,
      connector_id: syncRun.connectorId,
      network: syncRun.network,
      status: syncRun.status,
      fetched_count: syncRun.fetchedCount,
      normalized_count: syncRun.normalizedCount,
      review_items_created: syncRun.reviewItemsCreated,
      partial_failures_json: JSON.stringify(syncRun.partialFailures || []),
      created_at: syncRun.createdAt,
      completed_at: syncRun.completedAt,
    }))
  );
  await replaceTable(
    "coupon_snapshots",
    next.snapshots.map((snapshot) => ({
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
      raw_json: JSON.stringify(snapshot.raw || {}),
      status: snapshot.status,
      last_seen_at: snapshot.lastSeenAt || null,
      updated_at: snapshot.updatedAt,
      created_at: snapshot.createdAt,
    }))
  );
  await replaceTable(
    "review_items",
    next.reviewItems.map((item) => ({
      id: item.id,
      workspace_id: item.workspaceId,
      connector_id: item.connectorId,
      logical_key: item.logicalKey,
      merchant_id: item.merchantId,
      merchant_name: item.merchantName,
      title: item.title,
      change_type: item.changeType,
      reason: item.reason,
      confidence: item.confidence,
      status: item.status,
      before_snapshot_json: item.beforeSnapshot ? JSON.stringify(item.beforeSnapshot) : null,
      after_snapshot_json: item.afterSnapshot ? JSON.stringify(item.afterSnapshot) : null,
      sync_run_id: item.syncRunId,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    }))
  );

  return next;
}

module.exports = {
  ensureWorkspace,
  findConnectorByNetwork,
  insertReviewItem,
  insertSyncRun,
  listConnectors,
  listReviewItems,
  listSnapshots,
  listSnapshotsByConnector,
  mapConnectorRow,
  mapReviewItemRow,
  mapSnapshotRow,
  mapSyncRunRow,
  resetSupabaseClientForTests,
  readState,
  setSupabaseClientForTests,
  supersedeOpenReviewItems,
  updateReviewItemStatusById,
  upsertConnector,
  upsertSnapshot,
  writeState,
};
