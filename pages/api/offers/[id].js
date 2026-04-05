const { ConnectorError } = require("../../../lib/server/connectors.cjs");
const { updateOfferPublishStatus } = require("../../../lib/server/syncEngine.cjs");
const { resolveRequestContext } = require("../../../lib/server/requestAuth.cjs");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  }

  try {
    const context = await resolveRequestContext(req);
    const offer = await updateOfferPublishStatus(req.query.id, req.body?.action, {
      workspaceId: context.workspaceId,
    });
    return res.status(200).json({ ok: true, offer });
  } catch (error) {
    const typed =
      error instanceof ConnectorError
        ? error
        : Object.assign(new ConnectorError("unknown", error.message || "Unexpected error"), {
            statusCode: error.statusCode,
          });
    const statusCode =
      typed.statusCode || (typed.type === "validation" ? 400 : typed.type === "auth" ? 401 : 500);
    return res.status(statusCode).json({
      ok: false,
      error: { type: typed.type, message: typed.message },
    });
  }
}
