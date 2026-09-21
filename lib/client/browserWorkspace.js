const SETTINGS_KEY = "affitalink.browser.workspace.v1";
const CREDENTIALS_KEY = "affitalink.session.credentials.v1";
const DATABASE_NAME = "affitalink";
const COUPON_STORE = "coupons";

function parseStoredJson(storage, key, fallback) {
  if (!storage) return fallback;
  try {
    return JSON.parse(storage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function readSettings() {
  if (typeof window === "undefined") return { connectors: {}, lastFetchAt: null };
  return parseStoredJson(window.localStorage, SETTINGS_KEY, { connectors: {}, lastFetchAt: null });
}

function writeSettings(settings) {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("affitalink:workspace-change"));
}

export function listBrowserConnectors() {
  return Object.values(readSettings().connectors || {});
}

export function getBrowserConnector(network) {
  return readSettings().connectors?.[network] || null;
}

export function saveBrowserConnector(network, connector) {
  const settings = readSettings();
  settings.connectors = { ...settings.connectors, [network]: { ...connector, network } };
  writeSettings(settings);
  return settings.connectors[network];
}

export function removeBrowserConnector(network) {
  const settings = readSettings();
  delete settings.connectors[network];
  writeSettings(settings);
  const credentials = readSessionCredentials();
  delete credentials[network];
  window.sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
}

function readSessionCredentials() {
  if (typeof window === "undefined") return {};
  return parseStoredJson(window.sessionStorage, CREDENTIALS_KEY, {});
}

export function getSessionCredentials(network) {
  return readSessionCredentials()[network] || null;
}

export function saveSessionCredentials(network, credentials) {
  const allCredentials = readSessionCredentials();
  allCredentials[network] = credentials;
  window.sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(allCredentials));
}

function openCouponDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("Browser storage is unavailable"));
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(COUPON_STORE)) {
        const store = database.createObjectStore(COUPON_STORE, { keyPath: "id" });
        store.createIndex("network", "network");
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function runCouponTransaction(mode, operation) {
  const database = await openCouponDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(COUPON_STORE, mode);
    let result;
    operation(transaction.objectStore(COUPON_STORE), (value) => { result = value; }, reject);
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => { database.close(); resolve(result); };
  });
}

export async function saveBrowserCoupons(coupons) {
  await runCouponTransaction("readwrite", (store) => {
    coupons.forEach((coupon) => store.put(coupon));
  });
  const settings = readSettings();
  settings.lastFetchAt = new Date().toISOString();
  writeSettings(settings);
}

export async function listBrowserCoupons() {
  return runCouponTransaction("readonly", (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export function getBrowserWorkspaceSummary() {
  const settings = readSettings();
  return { lastFetchAt: settings.lastFetchAt || null, connectors: Object.values(settings.connectors || {}) };
}
