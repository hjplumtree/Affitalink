const { parseStringPromise } = require("xml2js");
const { decryptObject, encryptObject } = require("./crypto.cjs");
const {
  createId,
  findConnectorByNetwork,
  getWorkspaceId,
  listConnectors: listStoredConnectors,
  upsertConnector,
} = require("./dataStore.cjs");

class ConnectorError extends Error {
  constructor(type, message, extra = {}) {
    super(message);
    this.name = "ConnectorError";
    this.type = type;
    this.extra = extra;
  }
}

const CONNECTOR_FIELDS = {
  cj: ["token", "requestor_id", "website_id"],
  rakuten: ["client_id", "client_secret", "sid"],
  testnet: ["test_token_77777", "test_sid_77777"],
};

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
  const fields = CONNECTOR_FIELDS[network];
  if (!fields) {
    throw new ConnectorError("validation", `Unsupported connector: ${network}`);
  }

  for (const field of fields) {
    if (!auth?.[field]) {
      throw new ConnectorError("validation", `Missing ${field}`);
    }
  }
}

async function getConnector(network, options = {}) {
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
  const workspaceId = getScopeWorkspaceId(options.workspaceId);
  const current = await getConnector(network, { workspaceId });
  const updated = updater(current);
  const persisted = await upsertConnector({
    ...updated,
    workspaceId,
    network,
    authEncrypted: updated.auth ? encryptObject(updated.auth) : null,
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
    throw new ConnectorError("auth", `Connector rejected request (${response.status})`, {
      status: response.status,
    });
  }

  return response.text();
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

  throw new ConnectorError("validation", "Unsupported connector");
}

async function fetchOffers(network, auth, merchantIds) {
  requireFields(network, auth);

  if (network === "testnet") {
    if (!Object.values(auth).every((value) => value === "77777")) {
      throw new ConnectorError("auth", "Invalid test connector credentials");
    }

    return TEST_OFFERS.filter((offer) => merchantIds.includes(offer.merchantId));
  }

  if (network === "cj") {
    const ids = merchantIds.join(",");
    const xml = await requestXml(
      `https://link-search.api.cj.com/v2/link-search?website-id=${auth.website_id}&advertiser-ids=${ids}&records-per-page=50`,
      { Authorization: `Bearer ${auth.token}` }
    );
    try {
      const parsed = await parseStringPromise(xml);
      const links = parsed["cj-api"].links[0].link || [];
      return links.map((offer) => ({
        sourceOfferId: offer["link-id"]?.[0],
        merchantId: offer["advertiser-id"]?.[0] || "",
        merchantName: offer["advertiser-name"]?.[0] || "",
        title: offer["link-name"]?.[0] || "",
        description: offer["description"]?.[0] || "",
        couponCode: offer["coupon-code"]?.[0] || "",
        destinationUrl: offer["clickUrl"]?.[0] || "",
        sourceUrl: offer["destination"]?.[0] || offer["clickUrl"]?.[0] || "",
        startsAt: offer["promotion-start-date"]?.[0] || "",
        endsAt: offer["promotion-end-date"]?.[0] || "",
        raw: {
          linkId: offer["link-id"]?.[0] || "",
          advertiserName: offer["advertiser-name"]?.[0] || "",
          linkType: offer["link-type"]?.[0] || "",
        },
      }));
    } catch (error) {
      throw new ConnectorError("parser", "Could not parse CJ offers response", {
        cause: error.message,
      });
    }
  }

  if (network === "rakuten") {
    const token = await fetchRakutenToken(auth);
    const xml = await requestXml(
      `https://api.linksynergy.com/coupon/1.0?mid=${merchantIds.join("|")}&resultsperpage=50`,
      { Authorization: `Bearer ${token}` }
    );
    try {
      const parsed = await parseStringPromise(xml);
      const links = parsed.couponfeed.link || [];
      return links.map((offer, index) => ({
        sourceOfferId: offer["advertiserid"]?.[0]
          ? `${offer["advertiserid"][0]}_${index}`
          : `rakuten_${index}`,
        merchantId: offer["advertiserid"]?.[0] || "",
        merchantName: offer["advertisername"]?.[0] || "",
        title: offer["promotiontypes"]?.[0]?.promotiontype?.[0]?._ || "",
        description: offer["offerdescription"]?.[0] || "",
        couponCode: offer["couponcode"]?.[0] || "",
        destinationUrl: offer["clickurl"]?.[0] || "",
        sourceUrl: offer["offerurl"]?.[0] || offer["clickurl"]?.[0] || "",
        startsAt: offer["offerstartdate"]?.[0] || "",
        endsAt: offer["offerenddate"]?.[0] || "",
        raw: {
          advertiserId: offer["advertiserid"]?.[0] || "",
          type: offer["$"]?.type || "",
        },
      }));
    } catch (error) {
      throw new ConnectorError("parser", "Could not parse Rakuten offers response", {
        cause: error.message,
      });
    }
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
  return persistConnector(network, (current) => ({
    ...current,
    merchants: (merchants || []).map((merchant) => ({
      id: merchant.id,
      name: merchant.name,
      selected: Boolean(merchant.selected),
    })),
  }), options);
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
  return connectors
    .map((entry) =>
      connectorSummary({
        ...entry,
        auth: entry.authEncrypted ? decryptObject(entry.authEncrypted) : null,
      })
    );
}

function connectorSummary(connector) {
  return {
    id: connector.id,
    network: connector.network,
    auth: connector.auth,
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
  fetchOffers,
  getConnector,
  listConnectors,
  persistConnector,
  resetConnector,
  saveMerchants,
};
