const { parseStringPromise } = require("xml2js");
const { createHash } = require("crypto");
const { decryptObject, encryptObject } = require("./crypto.cjs");
const { ConnectorError } = require("./connectorError.cjs");
const { mapOfferBatch, offerFailure, readText, firstText } = require("./offerBatch.cjs");
const {
  fetchEbayAdvertisers,
  fetchEbayOffers,
} = require("./networkAdapters/ebay.cjs");
const {
  createId,
  findConnectorByNetwork,
  getWorkspaceId,
  listConnectors: listStoredConnectors,
  replaceAdvertiserSelections,
  upsertConnector,
} = require("./dataStore.cjs");

const CONNECTOR_FIELDS = {
  cj: ["token", "requestor_id", "website_id"],
  rakuten: ["client_id", "client_secret", "sid"],
  impact: ["account_sid", "auth_token"],
  ebay: ["client_id", "client_secret", "marketplace_id", "delivery_country"],
  testnet: ["test_token_77777", "test_sid_77777"],
};

function requireSupportedNetwork(network) {
  if (!Object.hasOwn(CONNECTOR_FIELDS, network)) {
    throw new ConnectorError("validation", `Unsupported connector: ${network}`);
  }
}

const TEST_ADVERTISERS = [
  { id: "42680", name: "24S" },
  { id: "5338367", name: "Agoda" },
  { id: "4529306", name: "Forever 21" },
  { id: "13816", name: "Saks Fifth Avenue" },
  { id: "40584", name: "Yoox" },
];

const TEST_OFFERS = [
  {
    sourceOfferId: "1",
    merchantId: "13816",
    merchantName: "Saks Fifth Avenue",
    title: "Spring Sale",
    description: "Spring Sale: Up to 30% OFF select kids styles.",
    couponCode: "",
    destinationUrl:
      "https://click.linksynergy.com/fs-bin/click?id=F6WR5pfQj3Y&offerid=778432.10007473&type=3&subid=0",
    sourceUrl: "https://testnet.example/saks/spring-sale",
    startsAt: "",
    endsAt: "",
    raw: { source: "testnet", offerId: "1" },
  },
  {
    sourceOfferId: "2",
    merchantId: "4529306",
    merchantName: "Forever 21",
    title: "Extra 40% Off Sale",
    description: "Use code EXTRA40 at checkout.",
    couponCode: "EXTRA40",
    destinationUrl: "https://www.tkqlhce.com/click-7928723-15239843-1651827172000",
    sourceUrl: "https://testnet.example/forever21/extra40",
    startsAt: "",
    endsAt: "",
    raw: { source: "testnet", offerId: "2" },
  },
  {
    sourceOfferId: "3",
    merchantId: "42680",
    merchantName: "24S",
    title: "15% OFF ON YOUR FIRST PURCHASE",
    description: "24S first purchase offer.",
    couponCode: "15FIRST",
    destinationUrl:
      "https://click.linksynergy.com/fs-bin/click?id=F6WR5pfQj3Y&offerid=1104133.215&type=3&subid=0",
    sourceUrl: "https://testnet.example/24s/first-order",
    startsAt: "",
    endsAt: "",
    raw: { source: "testnet", offerId: "3" },
  },
];

function buildEmptyConnector(network) {
  return {
    id: createId(`connector_${network}`),
    workspaceId: getWorkspaceId(),
    network,
    auth: null,
    merchants: [],
    status: "not_connected",
    syncStatus: "idle",
    lastTestedAt: null,
    lastSyncAt: null,
    lastSuccessfulSyncAt: null,
    lastError: null,
  };
}

function getScopeWorkspaceId(workspaceId) {
  return workspaceId || getWorkspaceId();
}

function requireFields(network, auth) {
  requireSupportedNetwork(network);
  const fields = CONNECTOR_FIELDS[network];

  for (const field of fields) {
    if (!auth?.[field]) {
      throw new ConnectorError("validation", `Missing ${field}`);
    }
  }

  if (network === "ebay") {
    if (!/^EBAY_[A-Z0-9_]+$/i.test(auth.marketplace_id)) {
      throw new ConnectorError("validation", "Marketplace ID must look like EBAY_US");
    }
    if (!/^[A-Z]{2}$/i.test(auth.delivery_country)) {
      throw new ConnectorError("validation", "Delivery country must use a two-letter country code");
    }
  }
}

async function getConnector(network, options = {}) {
  requireSupportedNetwork(network);
  const workspaceId = getScopeWorkspaceId(options.workspaceId);
  const connector = await findConnectorByNetwork(workspaceId, network);

  if (!connector) {
    return {
      ...buildEmptyConnector(network),
      workspaceId,
    };
  }

  return {
    ...connector,
    auth: connector.authEncrypted ? decryptObject(connector.authEncrypted) : null,
  };
}

async function persistConnector(network, updater, options = {}) {
  requireSupportedNetwork(network);
  const workspaceId = getScopeWorkspaceId(options.workspaceId);
  const current = await getConnector(network, { workspaceId });
  const updated = updater(current);
  const authChanged = updated.auth !== current.auth;
  const persisted = await upsertConnector({
    ...updated,
    workspaceId,
    network,
    authEncrypted: authChanged
      ? (updated.auth ? encryptObject(updated.auth) : null)
      : current.authEncrypted,
  });
  delete persisted.auth;
  return {
    ...persisted,
    auth: persisted?.authEncrypted ? decryptObject(persisted.authEncrypted) : null,
  };
}

async function requestXml(url, headers = {}) {
  let response;
  try {
    response = await fetch(url, { headers });
  } catch (error) {
    throw new ConnectorError("transport", "Could not reach connector", {
      cause: error.message,
    });
  }

  if (!response.ok) {
    const type = response.status === 401 || response.status === 403 ? "auth" : "transport";
    throw new ConnectorError(type, `Connector rejected request (${response.status})`, {
      status: response.status,
    });
  }

  return response.text();
}

async function requestJson(url, headers = {}) {
  let response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json", ...headers } });
  } catch (error) {
    throw new ConnectorError("transport", "Could not reach connector", { cause: error.message });
  }
  if (!response.ok) {
    throw new ConnectorError("auth", `Connector rejected request (${response.status})`, { status: response.status });
  }
  try {
    return await response.json();
  } catch (error) {
    throw new ConnectorError("parser", "Could not parse connector response", { cause: error.message });
  }
}

function impactAuthorization(auth) {
  return `Basic ${Buffer.from(`${auth.account_sid}:${auth.auth_token}`).toString("base64")}`;
}

async function fetchRakutenToken(auth) {
  const tokenKey = Buffer.from(`${auth.client_id}:${auth.client_secret}`).toString("base64");
  let response;
  try {
    response = await fetch("https://api.linksynergy.com/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${tokenKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `scope=${auth.sid}`,
    });
  } catch (error) {
    throw new ConnectorError("transport", "Could not reach Rakuten token service", {
      cause: error.message,
    });
  }

  if (!response.ok) {
    throw new ConnectorError("auth", `Rakuten token request failed (${response.status})`, {
      status: response.status,
    });
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new ConnectorError("parser", "Rakuten token response missing access token");
  }
  return data.access_token;
}

async function fetchAdvertisers(network, auth) {
  requireFields(network, auth);

  if (network === "testnet") {
    if (Object.values(auth).every((value) => value === "77777")) {
      return TEST_ADVERTISERS;
    }
    throw new ConnectorError("auth", "Invalid test connector credentials");
  }

  if (network === "cj") {
    const xml = await requestXml(
      `https://advertiser-lookup.api.cj.com/v2/advertiser-lookup?requestor-cid=${auth.requestor_id}&advertiser-ids=joined&records-per-page=100`,
      { Authorization: `Bearer ${auth.token}` }
    );
    try {
      const parsed = await parseStringPromise(xml);
      return (parsed["cj-api"].advertisers[0].advertiser || []).map((advertiser) => ({
        id: advertiser["advertiser-id"][0],
        name: advertiser["advertiser-name"][0],
      }));
    } catch (error) {
      throw new ConnectorError("parser", "Could not parse CJ advertiser response", {
        cause: error.message,
      });
    }
  }

  if (network === "rakuten") {
    const token = await fetchRakutenToken(auth);
    const xml = await requestXml(
      "https://api.linksynergy.com/linklocator/1.0/getMerchByAppStatus/approved",
      { Authorization: `Bearer ${token}` }
    );
    try {
      const parsed = await parseStringPromise(xml);
      return (parsed["ns1:getMerchByAppStatusResponse"]["ns1:return"] || []).map(
        (advertiser) => ({
          id: advertiser["ns1:mid"][0],
          name: advertiser["ns1:name"][0],
        })
      );
    } catch (error) {
      throw new ConnectorError("parser", "Could not parse Rakuten advertiser response", {
        cause: error.message,
      });
    }
  }

  if (network === "impact") {
    const response = await requestJson(
      `https://api.impact.com/Mediapartners/${encodeURIComponent(auth.account_sid)}/Campaigns.json?RelationshipStage=JOINED&PageSize=1000`,
      { Authorization: impactAuthorization(auth) }
    );
    return (response.Campaigns || response.Records || []).map((campaign) => ({
      id: String(campaign.Id || campaign.CampaignId || ""),
      name: campaign.Name || campaign.CampaignName || "Unnamed advertiser",
    })).filter((advertiser) => advertiser.id);
  }

  if (network === "ebay") {
    return fetchEbayAdvertisers(auth);
  }

  throw new ConnectorError("validation", "Unsupported connector");
}

function readXmlText(offer, field) {
  const values = offer[field];
  if (values === undefined) return "";
  if (!Array.isArray(values) || values.length !== 1) {
    throw new ConnectorError("validation", `${field} must have one XML value`);
  }
  const value = values[0];
  if (value && typeof value === "object" && Object.keys(value).some((key) => key !== "_" && key !== "$")) {
    throw new ConnectorError("validation", `${field} contains nested XML instead of text`);
  }
  return readText(value && typeof value === "object" ? value._ : value, field);
}

function normalizeCjOffer(offer) {
  const couponCode = readXmlText(offer, "coupon-code");
  const promotionType = readXmlText(offer, "promotion-type").toLowerCase();
  if (!couponCode.trim() && !["coupon", "sale/discount"].includes(promotionType)) return null;
  const clickUrl = readXmlText(offer, "clickUrl");
  const destination = readXmlText(offer, "destination");
  return {
    sourceOfferId: readXmlText(offer, "link-id"),
    merchantId: readXmlText(offer, "advertiser-id"),
    merchantName: readXmlText(offer, "advertiser-name"),
    title: readXmlText(offer, "link-name"),
    description: readXmlText(offer, "description"),
    couponCode,
    destinationUrl: clickUrl || destination,
    sourceUrl: destination || clickUrl,
    startsAt: readXmlText(offer, "promotion-start-date"),
    endsAt: readXmlText(offer, "promotion-end-date"),
  };
}

async function fetchCjOffers(auth, merchantIds) {
  const items = [];
  const failures = [];
  const maximumPages = 100;
  for (let page = 1; page <= maximumPages; page += 1) {
    let xml;
    try {
      xml = await requestXml(
        `https://link-search.api.cj.com/v2/link-search?website-id=${auth.website_id}&advertiser-ids=${merchantIds.join(",")}&records-per-page=100&page-number=${page}`,
        { Authorization: `Bearer ${auth.token}` }
      );
      const parsed = (await parseStringPromise(xml))["cj-api"]?.links?.[0];
      const links = parsed?.link || [];
      const meta = parsed?.$;
      if (!meta || !/^\d+$/.test(meta["total-matched"]) ||
          !Number.isSafeInteger(Number(meta["total-matched"])) ||
          Number(meta["page-number"]) !== page || Number(meta["records-returned"]) !== links.length) {
        throw new ConnectorError("parser", "CJ returned invalid pagination data");
      }
      items.push(...links);
      if (items.length >= Number(meta["total-matched"])) break;
      if (!links.length || page === maximumPages) {
        failures.push(offerFailure(new ConnectorError("pagination", "CJ collection stopped before all records were received"), "collection", null, page));
        break;
      }
    } catch (error) {
      if (xml === undefined && !items.length) throw error;
      const failure = xml === undefined ? error : new ConnectorError("parser", "Could not parse CJ offers response");
      failures.push(offerFailure(failure, "collection", xml ?? null, page));
      break;
    }
  }
  return mapOfferBatch(items, normalizeCjOffer, failures);
}

function normalizeRakutenOffer(offer) {
  const merchantId = readXmlText(offer, "advertiserid");
  const clickUrl = readXmlText(offer, "clickurl");
  const sourceUrl = readXmlText(offer, "offerurl") || clickUrl;
  const startsAt = readXmlText(offer, "offerstartdate");
  const couponCode = readXmlText(offer, "couponcode");
  return {
    sourceOfferId: createHash("sha256").update([
      merchantId, sourceUrl, startsAt, couponCode,
    ].join("|")).digest("hex").slice(0, 24),
    merchantId,
    merchantName: readXmlText(offer, "advertisername"),
    title: "",
    description: readXmlText(offer, "offerdescription"),
    couponCode,
    destinationUrl: clickUrl,
    sourceUrl,
    startsAt,
    endsAt: readXmlText(offer, "offerenddate"),
    terms: readXmlText(offer, "restrictions"),
  };
}

async function fetchRakutenOffers(auth, merchantIds) {
  const token = await fetchRakutenToken(auth);
  const items = [];
  const failures = [];
  for (let page = 1; page <= 20; page += 1) {
    let xml;
    try {
      xml = await requestXml(
        `https://api.linksynergy.com/coupon/1.0?mid=${merchantIds.join("|")}&resultsperpage=500&pagenumber=${page}`,
        { Authorization: `Bearer ${token}` }
      );
      const parsed = await parseStringPromise(xml);
      if (!parsed.couponfeed) throw new ConnectorError("parser", "Missing Rakuten coupon feed");
      const links = parsed.couponfeed.link || [];
      items.push(...links);
      if (links.length < 500) break;
      if (page === 20) {
        failures.push(offerFailure(new ConnectorError("pagination", "Rakuten collection reached the page limit before completion was confirmed"), "collection", null, page));
      }
    } catch (error) {
      if (xml === undefined && !items.length) throw error;
      const failure = xml === undefined ? error : new ConnectorError("parser", "Could not parse Rakuten offers response");
      failures.push(offerFailure(failure, "collection", xml ?? null, page));
      break;
    }
  }
  return mapOfferBatch(items, normalizeRakutenOffer, failures);
}

async function fetchOffers(network, auth, merchantIds) {
  requireFields(network, auth);

  if (network === "testnet") {
    if (!Object.values(auth).every((value) => value === "77777")) {
      throw new ConnectorError("auth", "Invalid test connector credentials");
    }

    return mapOfferBatch(TEST_OFFERS.filter((offer) => merchantIds.includes(offer.merchantId)), (offer) => offer);
  }

  if (network === "cj") {
    return fetchCjOffers(auth, merchantIds);
  }

  if (network === "rakuten") {
    return fetchRakutenOffers(auth, merchantIds);
  }

  if (network === "impact") {
    const query = new URLSearchParams({ PageSize: "1000" });
    if (merchantIds.length) query.set("CampaignId", merchantIds.join(","));
    const response = await requestJson(
      `https://api.impact.com/Mediapartners/${encodeURIComponent(auth.account_sid)}/Promotions.json?${query}`,
      { Authorization: impactAuthorization(auth) }
    );
    const promotions = response.Promotions || response.Records || [];
    return mapOfferBatch(promotions, (promotion) => ({
      sourceOfferId: firstText(promotion, "Id", "PromotionId") || createHash("sha256").update(JSON.stringify(promotion)).digest("hex").slice(0, 24),
      merchantId: firstText(promotion, "CampaignId", "AdvertiserId"),
      merchantName: firstText(promotion, "CampaignName", "AdvertiserName"),
      title: firstText(promotion, "Name", "PromotionTitle", "Title"),
      description: firstText(promotion, "Description", "PromotionDescription"),
      couponCode: firstText(promotion, "PromoCode", "CouponCode"),
      destinationUrl: firstText(promotion, "TrackingLink", "LandingPageUrl", "Url"),
      sourceUrl: firstText(promotion, "LandingPageUrl", "Url", "TrackingLink"),
      startsAt: promotion.StartDate ?? "",
      endsAt: promotion.EndDate ?? "",
      terms: firstText(promotion, "Terms", "Restrictions"),
    }));
  }

  if (network === "ebay") {
    return fetchEbayOffers(auth);
  }

  throw new ConnectorError("validation", "Unsupported connector");
}

function mergeMerchantSelections(previousMerchants, fetchedMerchants) {
  const previousMap = new Map((previousMerchants || []).map((entry) => [entry.id, entry]));
  return fetchedMerchants
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((merchant) => ({
      id: merchant.id,
      name: merchant.name,
      selected: previousMap.get(merchant.id)?.selected ?? true,
    }));
}

async function connectAndFetchMerchants(network, auth, options = {}) {
  const merchants = await fetchAdvertisers(network, auth);
  return persistConnector(network, (current) => ({
    ...current,
    auth,
    merchants: mergeMerchantSelections(current.merchants, merchants),
    status: "connected",
    syncStatus: current.syncStatus || "idle",
    lastTestedAt: new Date().toISOString(),
    lastError: null,
  }), options);
}

async function saveMerchants(network, merchants, options = {}) {
  requireSupportedNetwork(network);
  const connector = await getConnector(network, {
    workspaceId: getScopeWorkspaceId(options.workspaceId),
  });
  return replaceAdvertiserSelections({
    ...connector,
    merchants: (merchants || []).map((merchant) => ({
      id: merchant.id,
      name: merchant.name,
      selected: Boolean(merchant.selected),
    })),
  });
}

async function resetConnector(network, options = {}) {
  return persistConnector(network, (current) => ({
    ...current,
    auth: null,
    merchants: [],
    status: "not_connected",
    syncStatus: "idle",
    lastError: null,
  }), options);
}

async function listConnectors(options = {}) {
  const connectors = await listStoredConnectors(getScopeWorkspaceId(options.workspaceId));
  return connectors.map(connectorSummary);
}

function connectorSummary(connector) {
  return {
    id: connector.id,
    network: connector.network,
    hasCredentials: Boolean(connector.auth || connector.authEncrypted),
    merchants: connector.merchants || [],
    status: connector.status || "not_connected",
    syncStatus: connector.syncStatus || "idle",
    lastTestedAt: connector.lastTestedAt || null,
    lastSyncAt: connector.lastSyncAt || null,
    lastSuccessfulSyncAt: connector.lastSuccessfulSyncAt || null,
    lastError: connector.lastError || null,
  };
}

module.exports = {
  CONNECTOR_FIELDS,
  ConnectorError,
  connectAndFetchMerchants,
  connectorSummary,
  fetchAdvertisers,
  fetchOffers,
  getConnector,
  listConnectors,
  persistConnector,
  requireSupportedNetwork,
  resetConnector,
  saveMerchants,
};
