const test = require("node:test");
const assert = require("node:assert/strict");
const { Builder, parseStringPromise } = require("xml2js");
const { fetchOffers } = require("../lib/server/connectors.cjs");
const { fetchNormalizedCoupons, normalizeOffer } = require("../lib/server/syncEngine.cjs");
const { normalizeEbayDeal } = require("../lib/server/networkAdapters/ebay.cjs");

const cjAuth = { token: "private-test-token", requestor_id: "company", website_id: "website" };
const ebayAuth = { client_id: "client", client_secret: "secret", marketplace_id: "EBAY_US", delivery_country: "US" };
const builder = new Builder({ headless: true });

function cjOffer(id, extra = {}) {
  return {
    "link-id": [String(id)], "advertiser-id": ["3989874"], "advertiser-name": ["Antonioli"],
    "link-name": ["October Offer FW26"], description: ["First order only\nOne use, logged-in users"],
    "promotion-type": ["Coupon"], "coupon-code": ["WLCM-20"],
    "promotion-start-date": ["2026-10-09 14:30:00.0"], "promotion-end-date": ["2026-10-31 18:29:00.0"],
    clickUrl: ["https://affiliate.example/click?one=1&two=2"], destination: ["https://shop.example/offer"],
    ...extra,
  };
}

function cjPage(links, total = links.length, page = 1) {
  return builder.buildObject({ "cj-api": { links: [{
    $: { "total-matched": String(total), "records-returned": String(links.length), "page-number": String(page) }, link: links,
  }] } });
}

function stubCj(t, xml) {
  t.mock.method(global, "fetch", async () => new Response(xml));
}

test("CJ preserves the full source, maps meanings, and keeps one usable link", async (t) => {
  const item = cjOffer("17364410", {
    category: [{ _: "Fashion", $: { id: "12" } }, { _: "Shoes", $: { id: "13" } }],
    "unknown-field": [{ $: { enabled: "false" }, value: ["0", "other"] }],
    "link-code-html": ["<a href='https://affiliate.example/'>Sale</a>"],
    clickUrl: [""],
  });
  const xml = cjPage([item]);
  stubCj(t, xml);
  const result = await fetchNormalizedCoupons("cj", cjAuth, ["3989874"]);
  const coupon = result.coupons[0];
  assert.equal(result.failures.length, 0);
  assert.equal(coupon.logicalKey, "cj:3989874:17364410");
  assert.equal(coupon.title, "October Offer FW26");
  assert.equal(coupon.description, item.description[0]);
  assert.equal(coupon.terms, "");
  assert.equal(coupon.couponCode, "WLCM-20");
  assert.equal(coupon.destinationUrl, "https://shop.example/offer");
  assert.equal(coupon.startsAt, "2026-10-09T14:30:00.000Z");
  assert.equal(coupon.endsAt, "2026-10-31T18:29:00.000Z");
  assert.deepEqual(coupon.raw, (await parseStringPromise(xml))["cj-api"].links[0].link[0]);
});

test("CJ separates ordinary ads from coupons and explicit sales without inferring from titles", async (t) => {
  const items = [
    cjOffer("ad", { "promotion-type": ["N/A"], "coupon-code": [""], "link-name": ["Biggest sale ever"] }),
    cjOffer("sale", { "promotion-type": ["Sale/Discount"], "coupon-code": [""] }),
    cjOffer("code", { "promotion-type": ["N/A"], "coupon-code": ["saveCaseSensitive"] }),
  ];
  stubCj(t, cjPage(items));
  const result = await fetchNormalizedCoupons("cj", cjAuth, ["3989874"]);
  assert.deepEqual(result.coupons.map((c) => c.sourceOfferId), ["sale", "code"]);
  assert.equal(result.coupons[0].couponCode, "");
  assert.equal(result.coupons[1].couponCode, "saveCaseSensitive");
  assert.equal(result.fetchedCount, 3);
  assert.equal(result.failures.length, 0);
  assert.equal(result.excluded[0].reason, "not_a_benefit");
  assert.equal(result.excluded[0].raw["link-id"][0], "ad");
});

test("ambiguous XML fields fail individually with their full source intact", async (t) => {
  stubCj(t, cjPage([
    cjOffer("good"),
    cjOffer("multiple", { description: ["First", "Second"] }),
    cjOffer("nested", { description: [{ unexpected: ["Not plain text"] }] }),
  ]));
  const result = await fetchNormalizedCoupons("cj", cjAuth, ["3989874"]);
  assert.equal(result.coupons.length, 1);
  assert.equal(result.failures.length, 2);
  assert.ok(result.failures.every((f) => f.stage === "conversion"));
  assert.deepEqual(result.failures[0].raw.description, ["First", "Second"]);
  assert.deepEqual(result.failures[1].raw.description, [{ unexpected: ["Not plain text"] }]);
});

test("source dates are timezone independent and invalid dates cannot become unknown dates", () => {
  const previous = process.env.TZ;
  const base = { sourceOfferId: 0, merchantId: 0, merchantName: "Shop", title: "", description: "Offer", couponCode: 0 };
  try {
    for (const timezone of ["Asia/Seoul", "America/Los_Angeles", "UTC"]) {
      process.env.TZ = timezone;
      const value = normalizeOffer("cj", { ...base, startsAt: "2026-10-09 14:30:00.0" });
      assert.equal(value.startsAt, "2026-10-09T14:30:00.000Z");
      assert.equal(value.sourceOfferId, "0");
      assert.equal(value.couponCode, "0");
      assert.equal(normalizeOffer("rakuten", { ...base, startsAt: "2026-10-09 14:30:00" }).startsAt, value.startsAt);
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
  for (const value of ["bad", "2026-02-30", "2026-10-09T24:00:00Z", "2026-10-09T14:99:00Z", 0, false]) {
    assert.throws(() => normalizeOffer("cj", { ...base, startsAt: value }), /invalid/);
  }
  assert.throws(() => normalizeOffer("impact", { ...base, startsAt: "2026-10-09 14:30:00" }), /timezone/);
  assert.equal(normalizeOffer("ebay", { ...base, startsAt: "2026-10-09T14:30:00+09:00" }).startsAt, "2026-10-09T05:30:00.000Z");
  assert.equal(normalizeOffer("cj", { ...base, startsAt: "" }).startsAt, null);
  assert.equal(normalizeOffer("cj", { ...base, startsAt: "1970-01-01" }).startsAt, "1970-01-01T00:00:00.000Z");
  assert.throws(() => normalizeOffer("cj", { ...base, startsAt: "2026-10-10", endsAt: "2026-10-09" }), /ends before/);
  assert.throws(() => normalizeOffer("cj", { ...base, terms: { text: "No coercion" } }), /single text/);
});

test("bad duplicate and out-of-range records retain their source without overwriting a good result", async (t) => {
  stubCj(t, cjPage([
    cjOffer("same"),
    cjOffer("same", { "promotion-end-date": ["invalid"] }),
    cjOffer("expired", { "promotion-start-date": ["2025-01-01"], "promotion-end-date": ["2025-12-31"] }),
  ]));
  const result = await fetchNormalizedCoupons("cj", cjAuth, ["3989874"], { from: "2026-10-16", to: "2026-11-15" });
  assert.equal(result.coupons.length, 1);
  assert.equal(result.coupons[0].endsAt, "2026-10-31T18:29:00.000Z");
  assert.equal(result.failures[0].raw["promotion-end-date"][0], "invalid");
  assert.equal(result.excluded[0].reason, "outside_date_range");
  assert.equal(result.excluded[0].raw["link-id"][0], "expired");
});

test("CJ continues beyond page 20 and uses total-matched even when a page is short", async (t) => {
  let calls = 0;
  t.mock.method(global, "fetch", async (url) => {
    const parsed = new URL(url);
    const page = Number(parsed.searchParams.get("page-number"));
    assert.equal(parsed.searchParams.get("advertiser-ids"), "3989874");
    calls += 1;
    return new Response(cjPage([cjOffer(page)], 21, page));
  });
  const result = await fetchNormalizedCoupons("cj", cjAuth, ["3989874"]);
  assert.equal(calls, 21);
  assert.equal(result.coupons.length, 21);
  assert.equal(result.failures.length, 0);
});

test("later HTTP failure preserves prior pages and never retains an authentication error body", async (t) => {
  let calls = 0;
  t.mock.method(global, "fetch", async () => ++calls === 1
    ? new Response(cjPage([cjOffer("good")], 2))
    : new Response("echoed private-test-token", { status: 429 }));
  const result = await fetchNormalizedCoupons("cj", cjAuth, ["3989874"]);
  assert.equal(result.coupons.length, 1);
  assert.equal(result.failures[0].stage, "collection");
  assert.equal(result.failures[0].type, "transport");
  assert.equal(result.failures[0].page, 2);
  assert.equal(result.failures[0].status, 429);
  assert.equal(result.failures[0].raw, null);
  assert.equal(JSON.stringify(result).includes(cjAuth.token), false);
});

test("malformed successful XML is retained while previous pages survive", async (t) => {
  let calls = 0;
  const brokenXml = "<cj-api><links><unfinished>";
  t.mock.method(global, "fetch", async () => new Response(++calls === 1 ? cjPage([cjOffer("good")], 2) : brokenXml));
  const result = await fetchNormalizedCoupons("cj", cjAuth, ["3989874"]);
  assert.equal(result.coupons.length, 1);
  assert.equal(result.failures[0].raw, brokenXml);
  assert.equal(result.failures[0].type, "parser");
});

test("CJ cannot report a complete batch after its safety limit", async (t) => {
  let calls = 0;
  t.mock.method(global, "fetch", async () => new Response(cjPage([cjOffer(++calls)], 101, calls)));
  const result = await fetchNormalizedCoupons("cj", cjAuth, ["3989874"]);
  assert.equal(calls, 100);
  assert.equal(result.coupons.length, 100);
  assert.equal(result.failures[0].type, "pagination");
});

test("empty CJ results are successful but first-request authentication failure still rejects", async (t) => {
  const mock = t.mock.method(global, "fetch", async () => new Response(cjPage([])));
  const result = await fetchNormalizedCoupons("cj", cjAuth, ["3989874"]);
  assert.equal(result.fetchedCount, 0);
  assert.deepEqual(result.failures, []);
  mock.mock.mockImplementation(async () => new Response("private-test-token", { status: 401 }));
  await assert.rejects(fetchNormalizedCoupons("cj", cjAuth, ["3989874"]), { type: "auth" });
});

test("Rakuten keeps classification out of title, preserves repeated metadata, and applies GMT", async (t) => {
  const xml = builder.buildObject({ couponfeed: { link: [{
    $: { type: "coupon" }, advertiserid: ["1"], advertisername: ["Shop"],
    offerdescription: ["Spend 100, save 20\nMembers only"], clickurl: ["https://affiliate.example/offer"],
    offerstartdate: ["2026-10-09 14:30:00"],
    promotiontypes: [{ promotiontype: [{ _: "Percentage off", $: { id: "1" } }, { _: "Free shipping", $: { id: "2" } }] }],
  }] } });
  t.mock.method(global, "fetch", async (url) => String(url).endsWith("/token")
    ? Response.json({ access_token: "private-access-token" }) : new Response(xml));
  const result = await fetchNormalizedCoupons("rakuten", { client_id: "id", client_secret: "secret", sid: "sid" }, ["1"]);
  assert.equal(result.failures.length, 0);
  assert.equal(result.coupons[0].title, "");
  assert.equal(result.coupons[0].startsAt, "2026-10-09T14:30:00.000Z");
  assert.equal(result.coupons[0].description, "Spend 100, save 20\nMembers only");
  assert.equal(result.coupons[0].raw.promotiontypes[0].promotiontype.length, 2);
  assert.equal(result.coupons[0].raw.$.type, "coupon");
});

test("eBay uses deal dates and group IDs, keeps zero prices and unknown source fields", () => {
  const item = {
    itemGroupId: "group-1", title: "Item", itemStartDate: "2020-01-01T00:00:00Z", itemEndDate: "2030-01-01T00:00:00Z",
    dealAffiliateWebUrl: "https://affiliate.example/deal", price: { value: 0, currency: "USD" },
    marketingPrice: { discountPercentage: 0 }, unknown: { enabled: false, list: [0, "a"] },
  };
  const coupon = normalizeOffer("ebay", normalizeEbayDeal(item));
  assert.equal(coupon.sourceOfferId, "group:group-1");
  assert.equal(coupon.startsAt, null);
  assert.equal(coupon.endsAt, null);
  assert.equal(coupon.destinationUrl, item.dealAffiliateWebUrl);
  assert.equal(coupon.description, "0% off · 0 USD");
  assert.deepEqual(coupon.raw, item);
});

test("eBay preserves good items across mapping and later-page failures", async (t) => {
  t.mock.method(global, "fetch", async (url) => {
    if (String(url).includes("/oauth2/token")) return Response.json({ access_token: "access" });
    if (new URL(url).searchParams.get("offset") === "0") return Response.json({
      next: "next-page", dealItems: [
        { itemId: "good", title: "Deal" },
        { itemId: "bad", title: "Bad price", price: { value: { nested: "wrong" } } },
      ],
    });
    return new Response("Unavailable", { status: 503 });
  });
  const result = await fetchNormalizedCoupons("ebay", ebayAuth, ["ebay-deals"]);
  assert.equal(result.coupons.length, 1);
  assert.equal(result.failures.length, 2);
  assert.deepEqual(result.failures.find((f) => f.stage === "conversion").raw.price, { value: { nested: "wrong" } });
  assert.equal(result.failures.find((f) => f.stage === "collection").status, 503);
});

test("Impact keeps the full JSON item and isolates malformed fields", async (t) => {
  const promotions = [
    { Id: 0, CampaignId: 0, CampaignName: "Shop", Name: "Offer", PromoCode: 0, Extra: { values: [0, false] } },
    { Id: "bad", CampaignId: "1", CampaignName: "Shop", Name: "Offer", Terms: { unknown: "shape" } },
  ];
  t.mock.method(global, "fetch", async () => Response.json({ Promotions: promotions }));
  const result = await fetchNormalizedCoupons("impact", { account_sid: "id", auth_token: "token" }, ["0"]);
  assert.equal(result.coupons[0].sourceOfferId, "0");
  assert.equal(result.coupons[0].couponCode, "0");
  assert.deepEqual(result.coupons[0].raw, promotions[0]);
  assert.deepEqual(result.failures[0].raw, promotions[1]);
});

test("the existing test connector also returns a collection result with its raw item", async () => {
  const result = await fetchOffers("testnet", { test_token_77777: "77777", test_sid_77777: "77777" }, ["13816"]);
  assert.equal(result.offers.length, 1);
  assert.equal(result.fetchedCount, 1);
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.excluded, []);
  assert.equal(result.offers[0].raw.title, result.offers[0].title);
});
