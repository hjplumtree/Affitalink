const { createHash } = require("crypto");
const {
  createId,
  getWorkspaceId,
  listSnapshots,
  saveSyncResult,
} = require("./dataStore.cjs");
const { ConnectorError, fetchOffers, getConnector } = require("./connectors.cjs");
const { offerFailure, readText } = require("./offerBatch.cjs");

function normalizeOptionalDate(value, network, field) {
  if (value === undefined || value === null || value === "") return null;
  // CJ and Rakuten define unzoned source timestamps as UTC/GMT. Never use the host timezone.
  const parts = typeof value === "string" && value.match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(\.\d{1,9})?)?(Z|[+-]\d{2}:?\d{2})?)?$/);
  const invalid = () => new ConnectorError("validation", `${field} has an invalid or unspecified timezone/date`);
  if (!parts) throw invalid();
  const [, day, hour, minute, second, fraction, zone] = parts;
  const midnight = new Date(`${day}T00:00:00.000Z`);
  if (!Number.isFinite(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== day ||
      Number(hour || 0) > 23 || Number(minute || 0) > 59 || Number(second || 0) > 59) throw invalid();
  if (hour && !zone && network !== "cj" && network !== "rakuten") throw invalid();
  const timestamp = Date.parse(`${day}T${hour || "00"}:${minute || "00"}:${second || "00"}${fraction || ""}${zone || "Z"}`);
  if (!Number.isFinite(timestamp)) throw invalid();
  return new Date(timestamp).toISOString();
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
  const normalized = {
    network,
    sourceOfferId: readText(offer.sourceOfferId, "sourceOfferId"),
    merchantId: readText(offer.merchantId, "merchantId"),
    merchantName: readText(offer.merchantName, "merchantName"),
    title: readText(offer.title, "title"),
    description: readText(offer.description, "description"),
    couponCode: readText(offer.couponCode, "couponCode"),
    destinationUrl: readText(offer.destinationUrl, "destinationUrl"),
    sourceUrl: readText(offer.sourceUrl ?? offer.destinationUrl, "sourceUrl"),
    startsAt: normalizeOptionalDate(offer.startsAt, network, "startsAt"),
    endsAt: normalizeOptionalDate(offer.endsAt, network, "endsAt"),
    terms: readText(offer.terms, "terms"),
    raw: offer.raw && typeof offer.raw === "object" && !Array.isArray(offer.raw)
      ? offer.raw
      : {},
    status: "active",
  };
  if (!normalized.sourceOfferId.trim() || !normalized.merchantId.trim() || !normalized.merchantName.trim() ||
      (!normalized.title.trim() && !normalized.description.trim() && !normalized.couponCode.trim())) {
    throw new ConnectorError("validation", "Coupon is missing required identity or benefit information");
  }
  if (normalized.startsAt && normalized.endsAt && normalized.startsAt > normalized.endsAt) {
    throw new ConnectorError("validation", "Coupon ends before it starts");
  }
  normalized.logicalKey = `${network}:${normalized.merchantId}:${normalized.sourceOfferId}`;
  normalized.id = normalized.logicalKey;
  return normalized;
}

function isCouponInRange(coupon, from, to) {
  const startsAt = coupon.startsAt ? Date.parse(coupon.startsAt) : null;
  const endsAt = coupon.endsAt ? Date.parse(coupon.endsAt) : null;
  const fromTime = from ? Date.parse(`${from}T00:00:00Z`) : null;
  const toTime = to ? Date.parse(`${to}T23:59:59.999Z`) : null;
  if (Number.isFinite(fromTime) && Number.isFinite(endsAt) && endsAt < fromTime) return false;
  if (Number.isFinite(toTime) && Number.isFinite(startsAt) && startsAt > toTime) return false;
  return true;
}

async function fetchNormalizedCoupons(network, auth, merchantIds, options = {}) {
  if (!Array.isArray(merchantIds) || merchantIds.length === 0) {
    throw new ConnectorError("validation", "Select at least one advertiser");
  }
  const range = validateDateRange(options.from, options.to);
  const batch = await (options.offerFetcher || fetchOffers)(network, auth, merchantIds);
  const failures = [...batch.failures];
  const excluded = [...batch.excluded];
  const couponsByKey = new Map();
  for (const rawCoupon of batch.offers) {
    try {
      const coupon = normalizeOffer(network, rawCoupon);
      if (isCouponInRange(coupon, range.from, range.to)) {
        couponsByKey.set(coupon.logicalKey, coupon);
      } else {
        excluded.push({ reason: "outside_date_range", raw: coupon.raw });
      }
    } catch (error) {
      failures.push(offerFailure(error, "conversion", rawCoupon.raw));
    }
  }
  return {
    coupons: [...couponsByKey.values()],
    failures,
    excluded,
    fetchedCount: batch.fetchedCount,
    range,
  };
}

function getScopeWorkspaceId(workspaceId) {
  return workspaceId || getWorkspaceId();
}

function createSyncRun(network, result, createdAt = new Date().toISOString()) {
  return {
    id: createId("sync"), network,
    status: result.failures.length ? (result.coupons.length ? "partial_failure" : "failed") : "success",
    fetchedCount: result.fetchedCount, normalizedCount: result.coupons.length,
    partialFailures: result.failures, excluded: result.excluded,
    requestedFrom: result.range.from, requestedTo: result.range.to,
    createdAt, completedAt: new Date().toISOString(),
  };
}

async function runManualSync(network, options = {}) {
  const requestedRange = validateDateRange(options.from, options.to);
  const workspaceId = getScopeWorkspaceId(options.workspaceId);
  const connector = await getConnector(network, { workspaceId });
  if (!connector.auth) throw new ConnectorError("validation", "Connect this network first");
  const selectedMerchants = (connector.merchants || []).filter((merchant) => merchant.selected);
  const fetchedAt = new Date().toISOString();
  let result;
  try {
    result = await fetchNormalizedCoupons(
      network,
      connector.auth,
      selectedMerchants.map((merchant) => merchant.id),
      { ...requestedRange, offerFetcher: options.fetchOffers }
    );
  } catch (error) {
    const connectorError = error instanceof ConnectorError ? error : new ConnectorError("transport", error.message || "Fetch failed");
    const failedRun = {
      ...createSyncRun(network, {
        coupons: [], failures: [offerFailure(connectorError, "collection")],
        excluded: [], fetchedCount: 0, range: requestedRange,
      }, fetchedAt),
      workspaceId, connectorId: connector.id,
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

  const syncRun = { ...createSyncRun(network, result, fetchedAt), workspaceId, connectorId: connector.id };
  const snapshots = result.coupons.map((coupon) => ({
    ...coupon,
    id: createCouponId(connector.id, coupon.logicalKey), workspaceId, connectorId: connector.id,
    lastSeenAt: fetchedAt, updatedAt: fetchedAt,
  }));
  const connectorUpdate = {
    ...connector, status: "connected", syncStatus: syncRun.status, lastSyncAt: fetchedAt,
    lastSuccessfulSyncAt: syncRun.status === "success" ? fetchedAt : connector.lastSuccessfulSyncAt,
    lastError: syncRun.status === "success" ? null : result.failures[0],
  };
  // A failed transaction must propagate. Do not replace it with a zero-item run.
  try {
    await saveSyncResult({ connector: connectorUpdate, syncRun, snapshots });
  } catch (error) {
    throw new ConnectorError("storage", error.message || "Could not save sync result");
  }
  return syncRun;
}

async function getOffers({ network, status = "active", workspaceId } = {}) {
  return (await listSnapshots({ workspaceId: getScopeWorkspaceId(workspaceId), network, status }))
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
}

module.exports = {
  createSyncRun,
  fetchNormalizedCoupons,
  getOffers,
  isCouponInRange,
  normalizeOffer,
  runManualSync,
};
