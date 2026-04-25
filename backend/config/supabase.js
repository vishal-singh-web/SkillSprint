const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.warn(
    "Supabase environment variables are missing. Add SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to .env."
  );
}

// Admin client is used only on the backend for trusted database operations.
// Never expose SUPABASE_SERVICE_ROLE_KEY in frontend code.
const supabaseAdmin = createClient(supabaseUrl || "", serviceRoleKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Auth client uses anon key for signup/login flows.
const supabaseAuthClient = createClient(supabaseUrl || "", anonKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabaseAdmin;
module.exports.supabaseAdmin = supabaseAdmin;
module.exports.supabaseAuthClient = supabaseAuthClient;
