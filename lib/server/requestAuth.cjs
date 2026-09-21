const { createClient } = require("@supabase/supabase-js");

let serviceClient;
let testResolver = null;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function getServiceClient() {
  if (serviceClient) return serviceClient;
  serviceClient = createClient(
    requireEnv("SUPABASE_URL"),
    process.env.SUPABASE_SECRET_KEY || requireEnv("SUPABASE_SECRET_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
  return serviceClient;
}

function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

async function resolveRequestContext(req) {
  if (testResolver) {
    return testResolver(req);
  }
  const token = getBearerToken(req);
  if (!token) {
    const error = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  }

  const supabase = getServiceClient();
  const userResult = await supabase.auth.getUser(token);
  if (userResult.error || !userResult.data?.user) {
    const error = new Error("Invalid session");
    error.statusCode = 401;
    throw error;
  }

  const user = userResult.data.user;
  const workspaceResult = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (workspaceResult.error) {
    const error = new Error(workspaceResult.error.message);
    error.statusCode = 500;
    throw error;
  }

  if (!workspaceResult.data) {
    const error = new Error("No workspace found for this user");
    error.statusCode = 403;
    throw error;
  }

  return {
    user,
    workspaceId: workspaceResult.data.id,
  };
}

module.exports = {
  resolveRequestContext,
  resetRequestContextResolverForTests() {
    testResolver = null;
  },
  setRequestContextResolverForTests(resolver) {
    testResolver = resolver;
  },
};
