const { getOffers } = require("../../../lib/server/syncEngine.cjs");
const { resolveRequestContext } = require("../../../lib/server/requestAuth.cjs");
const { getPublicWorkspaceId } = require("../../../lib/server/dataStore.cjs");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  }

  try {
    const { network, status, publishStatus } = req.query;
    const workspaceId =
      req.query.public === "1"
        ? getPublicWorkspaceId()
        : (await resolveRequestContext(req)).workspaceId;
    return res.status(200).json({
      ok: true,
      offers: await getOffers({
        network,
        status: status || "active",
        publishStatus: req.query.public === "1" ? publishStatus || "published" : publishStatus,
        workspaceId,
      }),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      error: { message: error.message || "Unexpected error" },
    });
  }
}
