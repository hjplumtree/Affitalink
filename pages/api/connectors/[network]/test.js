const {
  ConnectorError,
  connectAndFetchMerchants,
  connectorSummary,
} = require("../../../../lib/server/connectors.cjs");
const { resolveRequestContext } = require("../../../../lib/server/requestAuth.cjs");

function sendError(res, error) {
  const statusCode =
    error.statusCode ||
    (error.type === "validation" ? 400 : error.type === "auth" ? 401 : 500);
  return res.status(statusCode).json({
    ok: false,
    error: {
      type: error.type || "unknown",
      message: error.message || "Unexpected error",
    },
  });
}

export default async function handler(req, res) {
  const { network } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  }

  try {
    const context = await resolveRequestContext(req);
    const connector = await connectAndFetchMerchants(network, req.body?.auth || {}, {
      workspaceId: context.workspaceId,
    });
    return res.status(200).json({
      ok: true,
      connector: connectorSummary(connector),
    });
  } catch (error) {
    const typed =
      error instanceof ConnectorError
        ? error
        : Object.assign(new ConnectorError("unknown", error.message || "Unexpected error"), {
            statusCode: error.statusCode,
          });
    return sendError(res, typed);
  }
}
