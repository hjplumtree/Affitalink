const fs = require("fs");
const path = require("path");
const { createCipheriv, createDecipheriv, createHash, randomBytes } = require("crypto");

const DATA_DIR =
  process.env.AFFITALINK_DATA_DIR || path.join(process.cwd(), ".affitalink-data");
const LOCAL_SECRET_FILE = path.join(DATA_DIR, "app-secret");

function getOrCreateLocalSecret() {
  if (fs.existsSync(LOCAL_SECRET_FILE)) {
    return fs.readFileSync(LOCAL_SECRET_FILE, "utf8").trim();
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const generated = randomBytes(32).toString("hex");
  fs.writeFileSync(LOCAL_SECRET_FILE, generated, { mode: 0o600 });
  return generated;
}

function getKey() {
  const configuredSecret = process.env.AFFITALINK_SECRET;
  if (configuredSecret && configuredSecret.length < 32) {
    throw new Error("AFFITALINK_SECRET must contain at least 32 characters");
  }
  if (!configuredSecret && process.env.NODE_ENV === "production") {
    throw new Error("AFFITALINK_SECRET is required when account sync runs in production");
  }

  return createHash("sha256")
    .update(configuredSecret || getOrCreateLocalSecret())
    .digest();
}

function encryptObject(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const payload = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, payload]).toString("base64");
}

function decryptObject(encoded) {
  if (!encoded) return null;
  const buffer = Buffer.from(encoded, "base64");
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const payload = buffer.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  const raw = Buffer.concat([decipher.update(payload), decipher.final()]).toString("utf8");
  return JSON.parse(raw);
}

module.exports = {
  decryptObject,
  encryptObject,
};
