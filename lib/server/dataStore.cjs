const { randomUUID } = require("crypto");
const supabaseStore = require("./supabaseStore.cjs");

function getWorkspaceId() {
  return "workspace_default";
}

function getPublicWorkspaceId() {
  return process.env.AFFITALINK_PUBLIC_WORKSPACE_ID || getWorkspaceId();
}

function createId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

async function readState() {
  return supabaseStore.readState();
}

async function writeState(mutator) {
  return supabaseStore.writeState(mutator);
}

module.exports = {
  createId,
  ensureWorkspace: supabaseStore.ensureWorkspace,
  findConnectorByNetwork: supabaseStore.findConnectorByNetwork,
  getPublicWorkspaceId,
  getWorkspaceId,
  insertReviewItem: supabaseStore.insertReviewItem,
  insertSyncRun: supabaseStore.insertSyncRun,
  listConnectors: supabaseStore.listConnectors,
  listReviewItems: supabaseStore.listReviewItems,
  listSnapshots: supabaseStore.listSnapshots,
  listSnapshotsByConnector: supabaseStore.listSnapshotsByConnector,
  readState,
  resetSupabaseClientForTests: supabaseStore.resetSupabaseClientForTests,
  supersedeOpenReviewItems: supabaseStore.supersedeOpenReviewItems,
  updateSnapshotPublishStatusById: supabaseStore.updateSnapshotPublishStatusById,
  updateReviewItemStatusById: supabaseStore.updateReviewItemStatusById,
  upsertConnector: supabaseStore.upsertConnector,
  upsertSnapshot: supabaseStore.upsertSnapshot,
  writeState,
  setSupabaseClientForTests: supabaseStore.setSupabaseClientForTests,
};
