// These are the displayed benefit details a check applies to. Keep the SQL
// comparison in save_sync_result aligned; collection metadata is not included.
const BENEFIT_FIELDS = [
  "network", "merchantId", "merchantName", "title", "description", "terms",
  "couponCode", "destinationUrl", "startsAt", "endsAt",
];

function readOfferRecord(offer) {
  const prefix = `${offer.network}:${offer.merchantId}:`;
  const key = offer.logicalKey || offer.id || "";
  const checked = offer.checked === true;
  return {
    ...offer,
    sourceOfferId: offer.sourceOfferId || (key.startsWith(prefix) ? key.slice(prefix.length) : ""),
    checked,
    checkedAt: checked ? offer.checkedAt || null : null,
  };
}

function sameBenefitContent(previous, next) {
  if (!previous) return false;
  return BENEFIT_FIELDS.every((field) => {
    const left = previous[field] ?? "";
    const right = next[field] ?? "";
    if ((field === "startsAt" || field === "endsAt") && left && right) {
      return Date.parse(left) === Date.parse(right);
    }
    return left === right;
  });
}

function benefitContent(offer) {
  return Object.fromEntries(BENEFIT_FIELDS.map((field) => [
    field, offer[field] ?? (field === "startsAt" || field === "endsAt" ? null : ""),
  ]));
}

function checkError(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function validateCheckInput({ id, checked, expected } = {}) {
  if (typeof id !== "string" || !id.trim() || typeof checked !== "boolean" ||
      !expected || typeof expected !== "object" || Array.isArray(expected)) {
    throw checkError(400, "A link, check value and its displayed details are required");
  }
  for (const field of BENEFIT_FIELDS) {
    const value = expected[field];
    const isDate = field === "startsAt" || field === "endsAt";
    if (isDate ? value !== null && (typeof value !== "string" || !Number.isFinite(Date.parse(value))) : typeof value !== "string") {
      throw checkError(400, "The displayed link details are invalid");
    }
  }
}

module.exports = { benefitContent, checkError, readOfferRecord, sameBenefitContent, validateCheckInput };
