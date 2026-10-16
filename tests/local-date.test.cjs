const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { localDateInput } = require("../lib/localDate.cjs");

test("date inputs and CSV filenames follow the local day on both sides of UTC midnight", () => {
  const cases = [
    ["Asia/Seoul", "2026-10-16T23:20:00Z", "2026-10-17"],
    ["America/Los_Angeles", "2026-10-17T02:00:00Z", "2026-10-16"],
    ["UTC", "2026-10-17T02:00:00Z", "2026-10-17"],
  ];
  for (const [zone, instant, expected] of cases) {
    const result = spawnSync(process.execPath, ["-e", `process.stdout.write(require('./lib/localDate.cjs').localDateInput(0, new Date('${instant}')))`], {
      cwd: path.join(__dirname, ".."), env: { ...process.env, TZ: zone }, encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, expected, zone);
  }
});

test("relative dates cross months, leap days and years without changing the input date", () => {
  const now = new Date(2026, 11, 20, 8, 30);
  const original = now.getTime();
  assert.equal(localDateInput(30, now), "2027-01-19");
  assert.equal(now.getTime(), original);
  assert.equal(localDateInput(1, new Date(2028, 1, 28, 8)), "2028-02-29");
  assert.equal(localDateInput(-1, new Date(2026, 0, 1, 8)), "2025-12-31");
});
