const { ConnectorError } = require("../../../lib/server/connectors.cjs");
const { runManualSync } = require("../../../lib/server/syncEngine.cjs");
const { resolveRequestContext } = require("../../../lib/server/requestAuth.cjs");

export default async function handler(req, res) {
  const { network } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  }

  try {
    const context = await resolveRequestContext(req);
    const syncRun = await runManualSync(network, { workspaceId: context.workspaceId });
    return res.status(200).json({ ok: true, syncRun });
  } catch (error) {
    const typed =
      error instanceof ConnectorError
        ? error
        : new ConnectorError("unknown", error.message || "Sync failed");
    const statusCode = typed.type === "validation" ? 400 : typed.type === "auth" ? 401 : 500;
    return res.status(statusCode).json({
      ok: false,
      error: { type: typed.type, message: typed.message },
    });
  }
}
