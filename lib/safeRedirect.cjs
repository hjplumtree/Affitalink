function getSafeInternalPath(value, fallback = "/") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const origin = "https://affitalink.local";
    const destination = new URL(value, origin);
    if (destination.origin !== origin) return fallback;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}

module.exports = { getSafeInternalPath };
