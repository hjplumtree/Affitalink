const { ConnectorError } = require("../../../../lib/server/connectors.cjs");
const { createSyncRun, fetchNormalizedCoupons } = require("../../../../lib/server/syncEngine.cjs");
const { offerFailure } = require("../../../../lib/server/offerBatch.cjs");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  const fetchedAt = new Date().toISOString();
  try {
    const { auth, merchantIds, from, to } = req.body || {};
    const result = await fetchNormalizedCoupons(req.query.network, auth || {}, merchantIds || [], { from, to });
    return res.status(200).json({
      ok: true,
      coupons: result.coupons.map((coupon) => ({ ...coupon, id: coupon.logicalKey, fetchedAt })),
      failures: result.failures,
      syncRun: createSyncRun(req.query.network, result, fetchedAt),
    });
  } catch (error) {
    const typed = error instanceof ConnectorError ? error : new ConnectorError("unknown", error.message || "Fetch failed");
    return res.status(typed.type === "validation" ? 400 : typed.type === "auth" ? 401 : 502).json({
      ok: false, error: { type: typed.type, message: typed.message },
      syncRun: createSyncRun(req.query.network, {
        coupons: [], failures: [offerFailure(typed, "collection")],
        excluded: [], fetchedCount: 0, range: { from: null, to: null },
      }, fetchedAt),
    });
  }
}
