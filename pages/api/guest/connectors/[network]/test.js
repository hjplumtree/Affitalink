const { ConnectorError, fetchAdvertisers } = require("../../../../../lib/server/connectors.cjs");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  try {
    const merchants = await fetchAdvertisers(req.query.network, req.body?.auth || {});
    return res.status(200).json({ ok: true, merchants: merchants.map((merchant) => ({ ...merchant, selected: true })) });
  } catch (error) {
    const typed = error instanceof ConnectorError ? error : new ConnectorError("unknown", error.message || "Connection failed");
    return res.status(typed.type === "validation" ? 400 : typed.type === "auth" ? 401 : 502).json({ ok: false, error: { type: typed.type, message: typed.message } });
  }
}
