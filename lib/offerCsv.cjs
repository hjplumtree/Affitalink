// Edit this list to select, rename, reorder or format the saved common fields.
// A formatter receives only its field's value; export never remaps raw data.
const OFFER_CSV_COLUMNS = [
  { field: "network", header: "network" },
  { field: "merchantName", header: "merchantName" },
  { field: "title", header: "title" },
  { field: "description", header: "description" },
  { field: "terms", header: "terms" },
  { field: "couponCode", header: "couponCode" },
  { field: "startsAt", header: "startsAt", format: isoDate },
  { field: "endsAt", header: "endsAt", format: isoDate },
  { field: "destinationUrl", header: "destinationUrl" },
  { field: "checked", header: "checked", format: booleanValue },
  { field: "checkedAt", header: "checkedAt", format: isoDate },
];

function isoDate(value) {
  if (value == null || value === "") return "";
  // Accept ISO dates and timestamps with an explicit zone, never local-time guesses.
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) {
    throw new Error("Invalid date or missing time zone");
  }
  const calendarDate = value.slice(0, 10);
  const midnight = new Date(`${calendarDate}T00:00:00Z`);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || !Number.isFinite(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== calendarDate) {
    throw new Error("Invalid date");
  }
  return date.toISOString();
}

function booleanValue(value) {
  if (value == null || value === "") return "";
  if (typeof value !== "boolean") throw new Error("Expected true or false");
  return value;
}

function cellValue(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "boolean") return String(value);
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  // JSON keeps list boundaries, types, empty items and embedded separators intact.
  if (Array.isArray(value)) return JSON.stringify(value, (_key, item) => {
    if (item === null || Array.isArray(item) || typeof item === "string" || typeof item === "boolean" || (typeof item === "number" && Number.isFinite(item))) return item;
    throw new Error("Unsupported list value");
  });
  throw new Error("Unsupported value");
}

function escapeCell(value) {
  return `"${cellValue(value).replaceAll('"', '""')}"`;
}

function buildOfferCsv(offers, columns = OFFER_CSV_COLUMNS) {
  if (!columns.length || columns.some(({ field, header, format }) => typeof field !== "string" || !field || typeof header !== "string" || (format != null && typeof format !== "function"))) {
    throw new Error("Invalid CSV column settings");
  }
  const lines = [columns.map(({ header }) => escapeCell(header)).join(",")];
  const failures = [];
  for (const [index, offer] of offers.entries()) {
    let field;
    try {
      const cells = columns.map((column) => {
        field = column.field;
        const value = offer[field];
        // Give custom formatters a copy so they cannot change a stored list.
        return escapeCell(column.format ? column.format(structuredClone(value)) : value);
      });
      lines.push(cells.join(","));
    } catch (error) {
      failures.push({ index, id: offer?.id, field, reason: error.message || "Could not format value" });
    }
  }
  return { csv: lines.join("\r\n"), exportedCount: lines.length - 1, failures };
}

module.exports = { OFFER_CSV_COLUMNS, buildOfferCsv };
