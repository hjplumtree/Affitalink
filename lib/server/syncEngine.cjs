const { createHash } = require("crypto");
const {
  createId,
  getWorkspaceId,
  listSnapshots,
  saveSyncResult,
} = require("./dataStore.cjs");
const { ConnectorError, fetchOffers, getConnector } = require("./connectors.cjs");

function normalizeOptionalDate(value) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function parseDateInput(value, label) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ConnectorError("validation", `${label} must use YYYY-MM-DD`);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new ConnectorError("validation", `${label} is not a valid date`);
  }
  return value;
}

function validateDateRange(from, to) {
  const validFrom = parseDateInput(from, "Start date");
  const validTo = parseDateInput(to, "End date");
  if (validFrom && validTo && validFrom > validTo) {
    throw new ConnectorError("validation", "Start date must be before end date");
  }
  return { from: validFrom, to: validTo };
}

function createCouponId(connectorId, logicalKey) {
  return `coupon_${createHash("sha256").update(`${connectorId}:${logicalKey}`).digest("hex")}`;
}

function normalizeOffer(network, offer) {
  if (!offer.sourceOfferId || !offer.merchantId || !offer.merchantName || !offer.title) {
    throw new ConnectorError("validation", "Coupon is missing required fields");
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
    startsAt: normalizeOptionalDate(offer.startsAt),
    endsAt: normalizeOptionalDate(offer.endsAt),
    terms: String(offer.terms || ""),
    raw: offer.raw && typeof offer.raw === "object" && !Array.isArray(offer.raw)
      ? offer.raw
      : {},
    status: "active",
  };
  normalized.logicalKey = `${network}:${normalized.merchantId}:${normalized.sourceOfferId}`;
  normalized.id = normalized.logicalKey;
  return normalized;
}

function isCouponInRange(coupon, from, to) {
  const startsAt = coupon.startsAt ? Date.parse(coupon.startsAt) : null;
  const endsAt = coupon.endsAt ? Date.parse(coupon.endsAt) : null;
  const fromTime = from ? Date.parse(`${from}T00:00:00Z`) : null;
  const toTime = to ? Date.parse(`${to}T23:59:59Z`) : null;
  if (fromTime && endsAt && !Number.isNaN(endsAt) && endsAt < fromTime) return false;
  if (toTime && startsAt && !Number.isNaN(startsAt) && startsAt > toTime) return false;
  return true;
}

async function fetchNormalizedCoupons(network, auth, merchantIds, options = {}) {
  if (!Array.isArray(merchantIds) || merchantIds.length === 0) {
    throw new ConnectorError("validation", "Select at least one advertiser");
  }
  const range = validateDateRange(options.from, options.to);
  const rawCoupons = await (options.offerFetcher || fetchOffers)(network, auth, merchantIds);
  const failures = [];
  const couponsByKey = new Map();
  for (const rawCoupon of rawCoupons) {
    try {
      const coupon = normalizeOffer(network, rawCoupon);
      if (isCouponInRange(coupon, range.from, range.to)) {
        couponsByKey.set(coupon.logicalKey, coupon);
      }
    } catch (error) {
      failures.push({ type: error.type || "validation", message: error.message });
    }
  }
  return {
    coupons: [...couponsByKey.values()],
    failures,
    fetchedCount: rawCoupons.length,
    range,
  };
}

function getScopeWorkspaceId(workspaceId) {
  return workspaceId || getWorkspaceId();
}

async function runManualSync(network, options = {}) {
  const requestedRange = validateDateRange(options.from, options.to);
  const workspaceId = getScopeWorkspaceId(options.workspaceId);
  const connector = await getConnector(network, { workspaceId });
  if (!connector.auth) throw new ConnectorError("validation", "Connect this network first");
  const selectedMerchants = (connector.merchants || []).filter((merchant) => merchant.selected);
  const syncRunId = createId("sync");
  const fetchedAt = new Date().toISOString();

  try {
    const result = await fetchNormalizedCoupons(
      network,
      connector.auth,
      selectedMerchants.map((merchant) => merchant.id),
      { ...requestedRange, offerFetcher: options.fetchOffers }
    );
    const snapshots = result.coupons.map((coupon) => ({
      ...coupon,
      id: createCouponId(connector.id, coupon.logicalKey),
      workspaceId,
      connectorId: connector.id,
      lastSeenAt: fetchedAt,
      updatedAt: fetchedAt,
    }));
    const status = result.failures.length ? (result.coupons.length ? "partial_failure" : "failed") : "success";
    const syncRun = {
      id: syncRunId, workspaceId, connectorId: connector.id, network, status,
      fetchedCount: result.fetchedCount, normalizedCount: result.coupons.length,
      partialFailures: result.failures,
      requestedFrom: requestedRange.from, requestedTo: requestedRange.to,
      createdAt: fetchedAt, completedAt: fetchedAt,
    };
    const connectorUpdate = {
      ...connector,
      status: "connected",
      syncStatus: status,
      lastSyncAt: fetchedAt,
      lastSuccessfulSyncAt: status === "failed" ? connector.lastSuccessfulSyncAt : fetchedAt,
      lastError: status === "success" ? null : result.failures[0] || { message: "Fetch failed" },
    };
    await saveSyncResult({ connector: connectorUpdate, syncRun, snapshots });
    return syncRun;
  } catch (error) {
    const connectorError = error instanceof ConnectorError ? error : new ConnectorError("transport", error.message || "Fetch failed");
    const failedRun = {
      id: syncRunId, workspaceId, connectorId: connector.id, network, status: "failed",
      fetchedCount: 0, normalizedCount: 0,
      partialFailures: [{ type: connectorError.type, message: connectorError.message }],
      requestedFrom: requestedRange.from, requestedTo: requestedRange.to,
      createdAt: fetchedAt, completedAt: new Date().toISOString(),
    };
    const connectorUpdate = {
      ...connector, syncStatus: "failed", lastSyncAt: fetchedAt,
      lastError: { type: connectorError.type, message: connectorError.message },
    };
    try {
      await saveSyncResult({ connector: connectorUpdate, syncRun: failedRun, snapshots: [] });
    } catch (persistenceError) {
      connectorError.extra = {
        ...connectorError.extra,
        persistenceError: persistenceError.message,
      };
    }
    throw connectorError;
  }
}

async function getOffers({ network, status = "active", workspaceId } = {}) {
  return (await listSnapshots({ workspaceId: getScopeWorkspaceId(workspaceId), network, status }))
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
    .map((coupon) => ({
      id: coupon.id, network: coupon.network, merchantId: coupon.merchantId,
      merchantName: coupon.merchantName, title: coupon.title, description: coupon.description,
      terms: coupon.terms || coupon.raw?.terms || "", couponCode: coupon.couponCode,
      destinationUrl: coupon.destinationUrl, sourceUrl: coupon.sourceUrl,
      startsAt: coupon.startsAt, endsAt: coupon.endsAt, status: coupon.status,
      lastSeenAt: coupon.lastSeenAt, updatedAt: coupon.updatedAt,
    }));
}

module.exports = {
  createCouponId,
  fetchNormalizedCoupons,
  getOffers,
  isCouponInRange,
  normalizeOffer,
  runManualSync,
  validateDateRange,
};
