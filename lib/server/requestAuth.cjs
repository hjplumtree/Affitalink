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
  const membershipResult = await supabase
    .from("workspace_memberships")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipResult.error) {
    const error = new Error(membershipResult.error.message);
    error.statusCode = 500;
    throw error;
  }

  if (!membershipResult.data) {
    const error = new Error("No workspace membership found for this user");
    error.statusCode = 403;
    throw error;
  }

  return {
    user,
    workspaceId: membershipResult.data.workspace_id,
    role: membershipResult.data.role,
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
