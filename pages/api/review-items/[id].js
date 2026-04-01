const { ConnectorError } = require("../../../lib/server/connectors.cjs");
const { updateReviewItemStatus } = require("../../../lib/server/syncEngine.cjs");
const { resolveRequestContext } = require("../../../lib/server/requestAuth.cjs");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  }

  try {
    const context = await resolveRequestContext(req);
    const item = await updateReviewItemStatus(req.query.id, req.body?.action, {
      workspaceId: context.workspaceId,
    });
    return res.status(200).json({ ok: true, item });
  } catch (error) {
    const typed =
      error instanceof ConnectorError
        ? error
        : new ConnectorError("unknown", error.message || "Unexpected error");
    const statusCode = typed.type === "validation" ? 400 : 500;
    return res.status(statusCode).json({
      ok: false,
      error: { type: typed.type, message: typed.message },
    });
  }
}
