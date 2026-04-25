const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "Supabase environment variables are missing. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env."
  );
}

// Admin client is used only on the backend for trusted database operations.
// Never expose SUPABASE_SERVICE_ROLE_KEY in frontend code.
const supabase = createClient(supabaseUrl || "", serviceRoleKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
