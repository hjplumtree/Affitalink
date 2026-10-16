const test = require("node:test");
const assert = require("node:assert/strict");
const { OFFER_CSV_COLUMNS, buildOfferCsv } = require("../lib/offerCsv.cjs");

// Independent reader: count CSV records, including quoted multiline cells.
function parseCsv(csv) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    if (char === '"') {
      if (quoted && csv[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (!quoted && char === ",") { row.push(cell); cell = ""; }
    else if (!quoted && char === "\r" && csv[i + 1] === "\n") {
      row.push(cell); rows.push(row); row = []; cell = ""; i += 1;
    } else cell += char;
  }
  assert.equal(quoted, false, "closed quotes");
  row.push(cell); rows.push(row);
  return rows;
}

const offer = {
  id: "cj:9:42", network: "cj", merchantName: "상점", title: 'Sale, "특가"',
  description: "First\r\nSecond\nThird", terms: "", couponCode: "Save-000",
  startsAt: "2026-10-01T09:00:00+09:00", endsAt: null,
  destinationUrl: "https://example.com/?a=1&b=2", checked: false, checkedAt: null,
  raw: { title: "Do not remap", terms: "Must not fill the empty terms" },
};

test("default CSV has exactly 11 columns, one link, saved values and UTC dates", () => {
  const before = structuredClone(offer);
  const result = buildOfferCsv([offer]);
  const rows = parseCsv(result.csv);
  assert.deepEqual(rows[0], ["network", "merchantName", "title", "description", "terms", "couponCode", "startsAt", "endsAt", "destinationUrl", "checked", "checkedAt"]);
  assert.deepEqual(rows[1], ["cj", "상점", 'Sale, "특가"', "First\r\nSecond\nThird", "", "Save-000", "2026-10-01T00:00:00.000Z", "", offer.destinationUrl, "false", ""]);
  assert.equal(result.exportedCount, 1);
  assert.deepEqual(result.failures, []);
  assert.deepEqual(offer, before);
});

test("zero, false, empty and missing values remain distinct and lists round-trip", () => {
  const values = [0, false, "", null, undefined, ["a,b", '"quote"', "line\nbreak", 0, false, "", null, ["nested"]]];
  const result = buildOfferCsv(values.map((title) => ({ ...offer, title })));
  const titles = parseCsv(result.csv).slice(1).map((row) => row[2]);
  assert.deepEqual(titles.slice(0, 5), ["0", "false", "", "", ""]);
  assert.deepEqual(JSON.parse(titles[5]), values[5]);
  assert.equal(result.exportedCount, values.length);
});

test("column config selects, reorders, renames and formats without changing saved data", () => {
  const row = { ...offer, terms: ["first", "second"] };
  const before = structuredClone(row);
  const config = [
    { field: "terms", header: 'Conditions, "all"\nitems', format: (value) => { value.reverse(); return value; } },
    { field: "checked", header: "Reviewed", format: (value) => value ? "Yes" : "No" },
    { field: "title", header: "Name" },
  ];
  const rows = parseCsv(buildOfferCsv([row], config).csv);
  assert.deepEqual(rows[0], config.map((column) => column.header));
  assert.deepEqual(rows[1], ['["second","first"]', "No", row.title]);
  assert.deepEqual(row, before);
  assert.equal(OFFER_CSV_COLUMNS.length, 11);
});

test("checked and its timestamp export together with an explicit UTC zone", () => {
  const rows = parseCsv(buildOfferCsv([{ ...offer, checked: true, checkedAt: "2026-10-17T03:12:34.567-04:00" }]).csv);
  assert.deepEqual(rows[1].slice(9), ["true", "2026-10-17T07:12:34.567Z"]);
});

test("invalid dates are excluded without timezone guesses or calendar rollover", () => {
  const invalid = ["bad", "2026-02-30", "2026-02-30T12:00:00Z", "2026-10-17T12:00:00", "2026-10-17T24:00:00Z", "2026-10-17T00:00:00+25:00", 0];
  const input = invalid.map((endsAt, index) => ({ ...offer, id: String(index), endsAt }));
  input.push({ ...offer, endsAt: "2028-02-29" });
  const result = buildOfferCsv(input);
  assert.equal(result.exportedCount, 1);
  assert.equal(result.failures.length, invalid.length);
  assert.ok(result.failures.every((failure, index) => failure.index === index && failure.id === String(index) && failure.field === "endsAt" && /Invalid date/.test(failure.reason)));
  assert.equal(parseCsv(result.csv)[1][7], "2028-02-29T00:00:00.000Z");
});

test("bad values cannot silently become object strings, null list entries or partial rows", () => {
  const invalid = [{ nested: "value" }, NaN, Infinity, [false, undefined], [NaN], [{ nested: 0 }]];
  const input = invalid.map((terms) => ({ ...offer, terms }));
  input.splice(2, 0, offer);
  input.push({ ...offer, checked: "false" });
  const result = buildOfferCsv(input);
  assert.equal(result.exportedCount, 1);
  assert.equal(input.length, result.exportedCount + result.failures.length);
  const rows = parseCsv(result.csv);
  assert.equal(rows.length, 2);
  assert.ok(rows.every((row) => row.length === 11));
  assert.equal(result.failures.at(-1).field, "checked");
  assert.equal(result.failures.at(-1).reason, "Expected true or false");
});

test("formatter errors exclude only their row; zero output and empty input remain explicit", () => {
  const columns = [{ field: "title", header: "Title", format: (value) => { if (!value) throw new Error("Missing title"); return value; } }];
  const result = buildOfferCsv([{ title: "" }, offer, { title: null }], columns);
  assert.equal(result.exportedCount, 1);
  assert.deepEqual(result.failures.map(({ index, reason }) => ({ index, reason })), [{ index: 0, reason: "Missing title" }, { index: 2, reason: "Missing title" }]);
  assert.equal(buildOfferCsv([{ title: "" }], columns).exportedCount, 0);
  assert.deepEqual(buildOfferCsv([], columns), { csv: '"Title"', exportedCount: 0, failures: [] });
});

test("exports every supplied matching row even beyond a 50-row page", () => {
  const input = Array.from({ length: 102 }, (_, index) => ({ ...offer, title: String(index) }));
  const result = buildOfferCsv(input);
  assert.equal(result.exportedCount, 102);
  assert.equal(parseCsv(result.csv).length, 103);
  assert.equal(parseCsv(result.csv).at(-1)[2], "101");
});

test("invalid code configuration fails explicitly", () => {
  for (const columns of [[], [{ header: "Title" }], [{ field: "title" }], [{ field: "title", header: "Title", format: "utc" }]]) {
    assert.throws(() => buildOfferCsv([offer], columns), /Invalid CSV column settings/);
  }
});
