const { ConnectorError } = require("../connectorError.cjs");

const EBAY_DEALS_MERCHANT = { id: "ebay-deals", name: "eBay Deals" };

async function parseJsonResponse(response, source) {
  try {
    return await response.json();
  } catch (error) {
    if (response.ok) {
      throw new ConnectorError("parser", `Could not parse ${source} response`, {
        cause: error.message,
      });
    }
    return {};
  }
}

async function fetchAccessToken(auth) {
  const credentials = Buffer.from(`${auth.client_id}:${auth.client_secret}`).toString("base64");
  let response;
  try {
    response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope",
      }).toString(),
    });
  } catch (error) {
    throw new ConnectorError("transport", "Could not reach eBay", { cause: error.message });
  }

  const payload = await parseJsonResponse(response, "eBay token");
  if (!response.ok) {
    throw new ConnectorError(
      "auth",
      payload.error_description || `eBay token request failed (${response.status})`,
      { status: response.status }
    );
  }
  if (!payload.access_token) {
    throw new ConnectorError("parser", "eBay token response missing access token");
  }
  return payload.access_token;
}

async function fetchDealPage(auth, accessToken, offset, limit) {
  const query = new URLSearchParams({
    commissionable: "true",
    delivery_country: auth.delivery_country.toUpperCase(),
    limit: String(limit),
    offset: String(offset),
  });
  let response;
  try {
    response = await fetch(`https://api.ebay.com/buy/deal/v1/deal_item?${query}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-EBAY-C-MARKETPLACE-ID": auth.marketplace_id.toUpperCase(),
      },
    });
  } catch (error) {
    throw new ConnectorError("transport", "Could not reach eBay Deal API", {
      cause: error.message,
    });
  }

  const payload = await parseJsonResponse(response, "eBay Deal API");
  if (!response.ok) {
    const message = response.status === 403
      ? "eBay Deal API access is not enabled for these application keys"
      : payload.errors?.[0]?.message || `eBay Deal API rejected request (${response.status})`;
    const type = response.status === 401 || response.status === 403 ? "auth" : "transport";
    throw new ConnectorError(type, message, { status: response.status });
  }
  return payload;
}

function describeDeal(item) {
  const price = item.price;
  const originalPrice = item.marketingPrice?.originalPrice;
  const discount = item.marketingPrice?.discountPercentage;
  const parts = [];
  if (discount) parts.push(`${discount}% off`);
  if (price?.value) parts.push(`${price.value} ${price.currency || ""}`.trim());
  if (originalPrice?.value) {
    parts.push(`was ${originalPrice.value} ${originalPrice.currency || ""}`.trim());
  }
  return parts.join(" · ");
}

function normalizeEbayDeal(item) {
  return {
    sourceOfferId: String(item.itemId || ""),
    merchantId: EBAY_DEALS_MERCHANT.id,
    merchantName: EBAY_DEALS_MERCHANT.name,
    title: item.title || "eBay deal",
    description: item.shortDescription || item.description || describeDeal(item),
    couponCode: "",
    destinationUrl: item.itemAffiliateWebUrl || item.dealAffiliateWebUrl || item.itemWebUrl || item.dealWebUrl || "",
    sourceUrl: item.itemWebUrl || item.dealWebUrl || item.itemAffiliateWebUrl || item.dealAffiliateWebUrl || "",
    startsAt: item.dealStartDate || item.itemStartDate || "",
    endsAt: item.dealEndDate || item.itemEndDate || "",
    terms: item.terms?.summary || item.terms?.fullText || "",
    raw: {
      categoryId: item.categoryId || "",
      condition: item.condition || "",
      price: item.price || null,
      marketingPrice: item.marketingPrice || null,
    },
  };
}

async function fetchEbayAdvertisers(auth) {
  const accessToken = await fetchAccessToken(auth);
  await fetchDealPage(auth, accessToken, 0, 1);
  return [EBAY_DEALS_MERCHANT];
}

async function fetchEbayOffers(auth) {
  const accessToken = await fetchAccessToken(auth);
  const deals = [];
  const limit = 100;
  const maximumPages = 100;
  for (let pageNumber = 0; pageNumber < maximumPages; pageNumber += 1) {
    const offset = pageNumber * limit;
    const page = await fetchDealPage(auth, accessToken, offset, limit);
    const items = page.dealItems || [];
    deals.push(...items.map(normalizeEbayDeal));
    if (!page.next || items.length < limit) return deals;
  }
  throw new ConnectorError("validation", "eBay returned more than 10,000 deals");
}

module.exports = {
  fetchEbayAdvertisers,
  fetchEbayOffers,
  normalizeEbayDeal,
};
