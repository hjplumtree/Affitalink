const {
  CONNECTOR_FIELDS,
  ConnectorError,
  connectorSummary,
  getConnector,
  resetConnector,
  saveMerchants,
} = require("../../../lib/server/connectors.cjs");
const { resolveRequestContext } = require("../../../lib/server/requestAuth.cjs");

function sendError(res, error) {
  const statusCode = error.type === "validation" ? 400 : error.type === "auth" ? 401 : 500;
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

  try {
    const context = await resolveRequestContext(req);
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        connector: {
          ...connectorSummary(
            await getConnector(network, { workspaceId: context.workspaceId })
          ),
          fields: CONNECTOR_FIELDS[network] || [],
        },
      });
    }

    if (req.method === "PUT") {
      const connector = await saveMerchants(network, req.body?.merchants || [], {
        workspaceId: context.workspaceId,
      });
      return res.status(200).json({
        ok: true,
        connector: connectorSummary(connector),
      });
    }

    if (req.method === "DELETE") {
      const connector = await resetConnector(network, {
        workspaceId: context.workspaceId,
      });
      return res.status(200).json({
        ok: true,
        connector: connectorSummary(connector),
      });
    }

    return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  } catch (error) {
    return sendError(
      res,
      error instanceof ConnectorError
        ? error
        : new ConnectorError("unknown", error.message || "Unexpected error")
    );
  }
}
