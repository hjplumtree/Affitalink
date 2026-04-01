const { getHealthSummary } = require("../../lib/server/syncEngine.cjs");
const { resolveRequestContext } = require("../../lib/server/requestAuth.cjs");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  }

  try {
    const context = await resolveRequestContext(req);
    return res.status(200).json({
      ok: true,
      health: await getHealthSummary({ workspaceId: context.workspaceId }),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      error: { message: error.message || "Unexpected error" },
    });
  }
}
