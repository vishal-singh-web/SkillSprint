const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const missingVariables = [
  ["SUPABASE_URL", supabaseUrl],
  ["SUPABASE_ANON_KEY", anonKey],
  ["SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required Supabase environment variables: ${missingVariables.join(", ")}`
  );
}

try {
  new URL(supabaseUrl);
} catch {
  throw new Error("SUPABASE_URL must be a valid URL");
}

// Admin client is used only on the backend for trusted database operations.
// Never expose SUPABASE_SERVICE_ROLE_KEY in frontend code.
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Auth client uses anon key for signup/login flows.
const supabaseAuthClient = createClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabaseAdmin;
module.exports.supabaseAdmin = supabaseAdmin;
module.exports.supabaseAuthClient = supabaseAuthClient;
