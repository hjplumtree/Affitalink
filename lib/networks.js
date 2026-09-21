const NETWORKS = {
  cj: { id: "cj", name: "CJ Affiliate", shortName: "CJ", fields: [
    { key: "token", label: "Personal access token", secret: true },
    { key: "requestor_id", label: "Company ID" },
    { key: "website_id", label: "Website ID" },
  ] },
  rakuten: { id: "rakuten", name: "Rakuten Advertising", shortName: "Rakuten", fields: [
    { key: "client_id", label: "Client ID" },
    { key: "client_secret", label: "Client secret", secret: true },
    { key: "sid", label: "Site ID" },
  ] },
  impact: { id: "impact", name: "impact.com", shortName: "Impact", fields: [
    { key: "account_sid", label: "Account SID" },
    { key: "auth_token", label: "Auth token", secret: true },
  ] },
};

function getNetwork(networkId) {
  return NETWORKS[networkId] || null;
}

function createEmptyCredentials(networkId) {
  const network = getNetwork(networkId);
  return network ? Object.fromEntries(network.fields.map((field) => [field.key, ""])) : {};
}

module.exports = { NETWORKS, createEmptyCredentials, getNetwork };
