const { ConnectorError } = require("./connectorError.cjs");

function readText(value, field) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  throw new ConnectorError("validation", `${field} must be a single text value`);
}

function firstText(source, ...fields) {
  for (const field of fields) {
    const value = readText(source[field], field);
    if (value !== "") return value;
  }
  return "";
}

function offerFailure(error, stage, raw = null, page = null) {
  return {
    stage,
    type: error.type || "validation",
    message: error.message,
    raw,
    ...(page === null ? {} : { page }),
    ...(error.extra?.status === undefined ? {} : { status: error.extra.status }),
  };
}

// Keep each source item even when its mapping fails or it is outside the benefit scope.
function mapOfferBatch(items, mapper, failures = []) {
  const result = { offers: [], failures: [...failures], excluded: [], fetchedCount: items.length };
  for (const raw of items) {
    try {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        throw new ConnectorError("validation", "Source offer must be an object");
      }
      const offer = mapper(raw);
      if (offer === null) result.excluded.push({ reason: "not_a_benefit", raw });
      else result.offers.push({ ...offer, raw });
    } catch (error) {
      result.failures.push(offerFailure(error, "conversion", raw));
    }
  }
  return result;
}

module.exports = { mapOfferBatch, offerFailure, readText, firstText };
