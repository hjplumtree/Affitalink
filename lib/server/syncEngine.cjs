const {
  createId,
  getWorkspaceId,
  insertReviewItem,
  insertSyncRun,
  listReviewItems: listStoredReviewItems,
  listSnapshots,
  listSnapshotsByConnector,
  supersedeOpenReviewItems,
  updateReviewItemStatusById,
  upsertSnapshot,
} = require("./dataStore.cjs");
const { ConnectorError, fetchOffers, getConnector, persistConnector } = require("./connectors.cjs");

const MEANINGFUL_FIELDS = [
  "title",
  "couponCode",
  "destinationUrl",
  "startsAt",
  "endsAt",
  "status",
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeOffer(network, offer) {
  if (!offer.sourceOfferId || !offer.merchantId || !offer.merchantName || !offer.title) {
    throw new ConnectorError("validation", "Offer missing required identity fields");
  }

  const normalized = {
    network,
    sourceOfferId: String(offer.sourceOfferId),
    merchantId: String(offer.merchantId),
    merchantName: String(offer.merchantName),
    title: String(offer.title),
    description: String(offer.description || ""),
    couponCode: String(offer.couponCode || ""),
    destinationUrl: String(offer.destinationUrl || ""),
    sourceUrl: String(offer.sourceUrl || offer.destinationUrl || ""),
    startsAt: String(offer.startsAt || ""),
    endsAt: String(offer.endsAt || ""),
    raw: offer.raw || {},
    status: "active",
  };

  normalized.logicalKey = [
    network,
    normalized.merchantId,
    normalized.sourceOfferId,
    slugify(normalized.title).slice(0, 60),
  ].join(":");

  return normalized;
}

function getChangedFields(previous, next) {
  return MEANINGFUL_FIELDS.filter((field) => (previous?.[field] || "") !== (next?.[field] || ""));
}

function createReviewItem({
  workspaceId,
  connectorId,
  logicalKey,
  merchantId,
  merchantName,
  title,
  changeType,
  reason,
  beforeSnapshot,
  afterSnapshot,
  syncRunId,
}) {
  return {
    id: createId("review"),
    workspaceId,
    connectorId,
    logicalKey,
    merchantId,
    merchantName,
    title,
    changeType,
    reason,
    confidence: changeType === "changed" ? "high" : "medium",
    status: "open",
    beforeSnapshot: beforeSnapshot || null,
    afterSnapshot: afterSnapshot || null,
    syncRunId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function getScopeWorkspaceId(workspaceId) {
  return workspaceId || getWorkspaceId();
}

async function runManualSync(network, options = {}) {
  const workspaceId = getScopeWorkspaceId(options.workspaceId);
  const connector = await getConnector(network, { workspaceId });
  if (!connector.auth) {
    throw new ConnectorError("validation", "Connect a source before syncing");
  }

  const selectedMerchants = (connector.merchants || []).filter((entry) => entry.selected);
  if (selectedMerchants.length === 0) {
    throw new ConnectorError("validation", "Select at least one merchant before syncing");
  }

  const offerFetcher = options.fetchOffers || fetchOffers;
  const syncRunId = createId("sync");
  const fetchedAt = new Date().toISOString();
  const rawOffers = [];
  const partialFailures = [];

  await insertSyncRun({
    id: syncRunId,
    workspaceId,
    connectorId: connector.id,
    network,
    status: "running",
    fetchedCount: 0,
    normalizedCount: 0,
    reviewItemsCreated: 0,
    partialFailures: [],
    createdAt: fetchedAt,
    completedAt: fetchedAt,
  });

  try {
    const offers = await offerFetcher(
      network,
      connector.auth,
      selectedMerchants.map((merchant) => merchant.id)
    );
    rawOffers.push(...offers);
    const normalizedOffers = [];

    for (const offer of offers) {
      try {
        normalizedOffers.push(normalizeOffer(network, offer));
      } catch (error) {
        partialFailures.push({
          type: error.type || "validation",
          message: error.message,
          sourceOfferId: offer.sourceOfferId || "unknown",
        });
      }
    }

    const existingSnapshots = await listSnapshotsByConnector(connector.id);
    const existingMap = new Map(existingSnapshots.map((entry) => [entry.logicalKey, entry]));
    const seenKeys = new Set();
    let reviewItemsCreated = 0;

    /*
      Manual sync flow
      fetch -> normalize -> compare against prior snapshots
           -> persist snapshots -> create review items -> write sync run
    */
    for (const offer of normalizedOffers) {
      const previous = existingMap.get(offer.logicalKey);
      const snapshot = {
        id: previous?.id || createId("snapshot"),
        workspaceId,
        connectorId: connector.id,
        network,
        logicalKey: offer.logicalKey,
        merchantId: offer.merchantId,
        merchantName: offer.merchantName,
        title: offer.title,
        description: offer.description,
        couponCode: offer.couponCode,
        destinationUrl: offer.destinationUrl,
        sourceUrl: offer.sourceUrl,
        startsAt: offer.startsAt,
        endsAt: offer.endsAt,
        raw: offer.raw,
        status: "active",
        lastSeenAt: fetchedAt,
        updatedAt: fetchedAt,
        createdAt: previous?.createdAt || fetchedAt,
      };
      seenKeys.add(offer.logicalKey);

      const changedFields = getChangedFields(previous, snapshot);
      if (!previous) {
        await supersedeOpenReviewItems(getWorkspaceId(), offer.logicalKey, fetchedAt);
        await insertReviewItem(
          createReviewItem({
            workspaceId,
            connectorId: connector.id,
            logicalKey: offer.logicalKey,
            merchantId: offer.merchantId,
            merchantName: offer.merchantName,
            title: offer.title,
            changeType: "new",
            reason: "New coupon found during sync",
            beforeSnapshot: null,
            afterSnapshot: snapshot,
            syncRunId,
          })
        );
        reviewItemsCreated += 1;
      } else if (previous.status === "missing") {
        await supersedeOpenReviewItems(getWorkspaceId(), offer.logicalKey, fetchedAt);
        await insertReviewItem(
          createReviewItem({
            workspaceId,
            connectorId: connector.id,
            logicalKey: offer.logicalKey,
            merchantId: offer.merchantId,
            merchantName: offer.merchantName,
            title: offer.title,
            changeType: "reappeared",
            reason: "Coupon reappeared after being missing",
            beforeSnapshot: previous,
            afterSnapshot: snapshot,
            syncRunId,
          })
        );
        reviewItemsCreated += 1;
      } else if (changedFields.length > 0) {
        await supersedeOpenReviewItems(getWorkspaceId(), offer.logicalKey, fetchedAt);
        await insertReviewItem(
          createReviewItem({
            workspaceId,
            connectorId: connector.id,
            logicalKey: offer.logicalKey,
            merchantId: offer.merchantId,
            merchantName: offer.merchantName,
            title: offer.title,
            changeType: "changed",
            reason: `Changed fields: ${changedFields.join(", ")}`,
            beforeSnapshot: previous,
            afterSnapshot: snapshot,
            syncRunId,
          })
        );
        reviewItemsCreated += 1;
      }

      await upsertSnapshot(snapshot);
    }

    for (const previous of existingSnapshots) {
      if (seenKeys.has(previous.logicalKey) || previous.status === "missing") {
        continue;
      }

      const missingSnapshot = {
        ...previous,
        status: "missing",
        updatedAt: fetchedAt,
      };
      await supersedeOpenReviewItems(getWorkspaceId(), previous.logicalKey, fetchedAt);
      await insertReviewItem(
        createReviewItem({
          workspaceId,
          connectorId: connector.id,
          logicalKey: previous.logicalKey,
          merchantId: previous.merchantId,
          merchantName: previous.merchantName,
          title: previous.title,
          changeType: "missing",
          reason: "Previously seen coupon is missing from the latest sync",
          beforeSnapshot: previous,
          afterSnapshot: missingSnapshot,
          syncRunId,
        })
      );
      reviewItemsCreated += 1;
      await upsertSnapshot(missingSnapshot);
    }

    const syncStatus =
      partialFailures.length > 0
        ? normalizedOffers.length > 0
          ? "partial_failure"
          : "failed"
        : "success";

    const syncRun = {
      id: syncRunId,
      workspaceId,
      connectorId: connector.id,
      network,
      status: syncStatus,
      fetchedCount: rawOffers.length,
      normalizedCount: normalizedOffers.length,
      reviewItemsCreated,
      partialFailures,
      createdAt: fetchedAt,
      completedAt: fetchedAt,
    };
    await insertSyncRun(syncRun);

    await persistConnector(network, (current) => ({
      ...current,
      syncStatus: syncRun.status,
      status: "connected",
      lastSyncAt: fetchedAt,
      lastSuccessfulSyncAt:
        syncRun.status === "failed" ? current.lastSuccessfulSyncAt : fetchedAt,
      lastError:
        syncRun.status === "success"
          ? null
          : {
              type: partialFailures[0]?.type || "partial_failure",
              message:
                partialFailures.length > 0
                  ? `${partialFailures.length} offer(s) could not be normalized`
                  : "Sync failed",
            },
    }), { workspaceId });

    return syncRun;
  } catch (error) {
    const connectorError =
      error instanceof ConnectorError
        ? error
        : new ConnectorError("transport", error.message || "Sync failed");

    const failedAt = new Date().toISOString();
    await insertSyncRun({
      id: syncRunId,
      workspaceId,
      connectorId: connector.id,
      network,
      status: "failed",
      fetchedCount: 0,
      normalizedCount: 0,
      reviewItemsCreated: 0,
      partialFailures: [{ type: connectorError.type, message: connectorError.message }],
      createdAt: failedAt,
      completedAt: failedAt,
    });

    await persistConnector(network, (current) => ({
      ...current,
      syncStatus: "failed",
      lastSyncAt: failedAt,
      lastError: {
        type: connectorError.type,
        message: connectorError.message,
      },
    }), { workspaceId });

    throw connectorError;
  }
}

async function getReviewItems({ network, status = "open", workspaceId } = {}) {
  const scopedWorkspaceId = getScopeWorkspaceId(workspaceId);
  const connector = network ? await getConnector(network, { workspaceId: scopedWorkspaceId }) : null;
  const { listConnectors } = require("./connectors.cjs");
  const connectors = new Map(
    (await listConnectors({ workspaceId: scopedWorkspaceId })).map((entry) => [
      entry.id,
      entry,
    ])
  );
  const items = (await listStoredReviewItems({
    workspaceId: scopedWorkspaceId,
    connectorId: connector?.id,
    status: status || undefined,
  }))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .map((item) => ({
      ...item,
      connector: connectors.get(item.connectorId)?.network || null,
    }));
  return items;
}

async function getHealthSummary(options = {}) {
  const { listConnectors } = require("./connectors.cjs");
  const scopedWorkspaceId = getScopeWorkspaceId(options.workspaceId);
  return (await listConnectors({ workspaceId: scopedWorkspaceId })).map((connector) => {
    const lastSyncAt = connector.lastSyncAt;
    const isStale =
      lastSyncAt && Date.now() - new Date(lastSyncAt).getTime() > 1000 * 60 * 60 * 24;
    return {
      network: connector.network,
      status: connector.status || "not_connected",
      syncStatus: connector.syncStatus || "idle",
      lastSyncAt,
      lastSuccessfulSyncAt: connector.lastSuccessfulSyncAt || null,
      lastError: connector.lastError || null,
      isStale: Boolean(isStale),
    };
  });
}

async function getOffers({ network, status = "active", workspaceId } = {}) {
  const scopedWorkspaceId = getScopeWorkspaceId(workspaceId);
  return (await listSnapshots({
    workspaceId: scopedWorkspaceId,
    network,
    status,
  }))
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
    .map((snapshot) => ({
      id: snapshot.id,
      network: snapshot.network,
      merchantId: snapshot.merchantId,
      merchantName: snapshot.merchantName,
      title: snapshot.title,
      description: snapshot.description,
      couponCode: snapshot.couponCode,
      destinationUrl: snapshot.destinationUrl,
      sourceUrl: snapshot.sourceUrl,
      startsAt: snapshot.startsAt,
      endsAt: snapshot.endsAt,
      status: snapshot.status,
      lastSeenAt: snapshot.lastSeenAt,
      updatedAt: snapshot.updatedAt,
    }));
}

async function updateReviewItemStatus(id, action, options = {}) {
  const allowedActions = new Set(["approve", "dismiss"]);
  if (!allowedActions.has(action)) {
    throw new ConnectorError("validation", "Unsupported review action");
  }

  const updated = await updateReviewItemStatusById(
    id,
    getScopeWorkspaceId(options.workspaceId),
    action === "approve" ? "approved" : "dismissed",
    new Date().toISOString()
  );

  if (!updated) {
    throw new ConnectorError("validation", "Review item not found");
  }

  return updated;
}

module.exports = {
  MEANINGFUL_FIELDS,
  getHealthSummary,
  getOffers,
  getReviewItems,
  runManualSync,
  updateReviewItemStatus,
};
