const { insertEarlyAccessRequest } = require("../../lib/server/earlyAccessStore.cjs");

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: { message: "Method not allowed" } });
  }

  try {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const name = typeof req.body?.name === "string" ? req.body.name : "";
    const siteUrl = typeof req.body?.siteUrl === "string" ? req.body.siteUrl : "";
    const notes = typeof req.body?.notes === "string" ? req.body.notes : "";
    const source = typeof req.body?.source === "string" ? req.body.source : "website";

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        ok: false,
        error: { message: "Enter a valid email address" },
      });
    }

    const request = await insertEarlyAccessRequest({
      email,
      name,
      siteUrl,
      notes,
      source,
    });

    return res.status(200).json({
      ok: true,
      request,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: { message: error.message || "Could not save early access request" },
    });
  }
}
