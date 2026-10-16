const { randomUUID } = require("crypto");
const supabaseStore = require("./supabaseStore.cjs");

function getWorkspaceId() {
  return "workspace_default";
}

function createId(prefix) {
  return `${prefix}_${randomUUID()}`;
}

module.exports = {
  createId,
  findConnectorByNetwork: supabaseStore.findConnectorByNetwork,
  getWorkspaceId,
  listConnectors: supabaseStore.listConnectors,
  listSnapshots: supabaseStore.listSnapshots,
  listSyncRuns: supabaseStore.listSyncRuns,
  replaceAdvertiserSelections: supabaseStore.replaceAdvertiserSelections,
  saveSyncResult: supabaseStore.saveSyncResult,
  setOfferChecked: supabaseStore.setOfferChecked,
  upsertConnector: supabaseStore.upsertConnector,
  setSupabaseClientForTests: supabaseStore.setSupabaseClientForTests,
};
