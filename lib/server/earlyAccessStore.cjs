const { randomUUID } = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const memoryRequests = [];
let testInserter = null;

function hasSupabaseConfig() {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function insertEarlyAccessRequest(input) {
  const record = {
    id: `ear_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    email: input.email.trim().toLowerCase(),
    name: input.name?.trim() || "",
    site_url: input.siteUrl?.trim() || "",
    notes: input.notes?.trim() || "",
    source: input.source?.trim() || "unknown",
    created_at: new Date().toISOString(),
  };

  if (testInserter) {
    return testInserter(record);
  }

  if (!hasSupabaseConfig()) {
    memoryRequests.push(record);
    return { ...record, storage: "memory" };
  }

  const supabase = getSupabaseClient();
  const result = await supabase.from("early_access_requests").insert(record).select("*").single();

  if (result.error) {
    throw new Error(result.error.message || "Could not save early access request");
  }

  return { ...result.data, storage: "supabase" };
}

module.exports = {
  insertEarlyAccessRequest,
  resetEarlyAccessInserterForTests() {
    testInserter = null;
  },
  setEarlyAccessInserterForTests(inserter) {
    testInserter = inserter;
  },
};
