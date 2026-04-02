const { getOffers } = require("../../../lib/server/syncEngine.cjs");
const { resolveRequestContext } = require("../../../lib/server/requestAuth.cjs");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  }

  try {
    const context = await resolveRequestContext(req);
    const { network, status } = req.query;
    return res.status(200).json({
      ok: true,
      offers: await getOffers({
        network,
        status: status || "active",
        workspaceId: context.workspaceId,
      }),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      error: { message: error.message || "Unexpected error" },
    });
  }
}
