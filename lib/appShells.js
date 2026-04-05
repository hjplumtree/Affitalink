const PUBLIC_EXACT_ROUTES = new Set(["/", "/login"]);

function isPublicShellRoute(pathname) {
  if (!pathname) return false;
  return PUBLIC_EXACT_ROUTES.has(pathname);
}

function getShellForPath(pathname) {
  return isPublicShellRoute(pathname) ? "public" : "dashboard";
}

module.exports = {
  getShellForPath,
  isPublicShellRoute,
};
