import { checkError, readOfferRecord, sameBenefitContent, validateCheckInput } from "../offerRecord.cjs";

const SETTINGS_KEY = "affitalink.browser.workspace.v1";
const CREDENTIALS_KEY = "affitalink.session.credentials.v1";
const DATABASE_NAME = "affitalink";
const COUPON_STORE = "coupons";
const SYNC_STORE = "syncRuns";

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
    const request = indexedDB.open(DATABASE_NAME, 2);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(COUPON_STORE)) {
        const store = database.createObjectStore(COUPON_STORE, { keyPath: "id" });
        store.createIndex("network", "network");
      }
      if (!database.objectStoreNames.contains(SYNC_STORE)) {
        const store = database.createObjectStore(SYNC_STORE, { keyPath: "id" });
        store.createIndex("network", "network");
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });
}

async function runCouponTransaction(stores, mode, operation) {
  const database = await openCouponDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(stores, mode);
    let result;
    let operationError;
    const abort = (error) => { operationError = error; transaction.abort(); };
    transaction.onabort = () => { database.close(); reject(operationError || transaction.error || new Error("Browser storage was not saved")); };
    transaction.oncomplete = () => { database.close(); resolve(result); };
    try {
      operation(transaction, (value) => { result = value; }, abort);
    } catch (error) {
      abort(error);
    }
  });
}

export async function saveBrowserCoupons(coupons, syncRuns = []) {
  await runCouponTransaction([COUPON_STORE, SYNC_STORE], "readwrite", (transaction, _resolve, abort) => {
    const store = transaction.objectStore(COUPON_STORE);
    coupons.forEach((coupon) => {
      const request = store.get(coupon.id);
      request.onsuccess = () => {
        try {
          const previous = request.result && readOfferRecord(request.result);
          const checked = sameBenefitContent(previous, coupon) && previous.checked;
          store.put(readOfferRecord({
            ...coupon,
            checked: Boolean(checked),
            checkedAt: checked ? previous.checkedAt : null,
          }));
        } catch (error) { abort(error); }
      };
    });
    syncRuns.forEach((run) => transaction.objectStore(SYNC_STORE).put(run));
  });
  const settings = readSettings();
  settings.lastFetchAt = new Date().toISOString();
  writeSettings(settings);
}

export async function listBrowserCoupons() {
  return runCouponTransaction(COUPON_STORE, "readonly", (transaction, resolve) => {
    const request = transaction.objectStore(COUPON_STORE).getAll();
    request.onsuccess = () => resolve((request.result || []).map(readOfferRecord));
  });
}

export async function setBrowserCouponChecked(input) {
  validateCheckInput(input);
  const { id, checked, expected } = input;
  return runCouponTransaction(COUPON_STORE, "readwrite", (transaction, resolve, abort) => {
    const store = transaction.objectStore(COUPON_STORE);
    const request = store.get(id);
    request.onsuccess = () => {
      try {
        if (!request.result) throw checkError(404, "This link is no longer available");
        if (!sameBenefitContent(request.result, expected)) {
          throw checkError(409, "This link changed. Review it and try again.");
        }
        const saved = readOfferRecord({
          ...request.result, checked, checkedAt: checked ? new Date().toISOString() : null,
        });
        store.put(saved);
        resolve(saved);
      } catch (error) { abort(error); }
    };
  });
}

export async function listBrowserSyncRuns(network) {
  return runCouponTransaction(SYNC_STORE, "readonly", (transaction, resolve) => {
    const store = transaction.objectStore(SYNC_STORE);
    const request = network ? store.index("network").getAll(network) : store.getAll();
    request.onsuccess = () => resolve((request.result || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  });
}

export function getBrowserWorkspaceSummary() {
  const settings = readSettings();
  return { lastFetchAt: settings.lastFetchAt || null, connectors: Object.values(settings.connectors || {}) };
}
