const supabase = require("../config/supabase");

const mapProfile = (profile) => {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    targetRole: profile.target_role,
    skills: profile.skills || [],
    skillScore: profile.skill_score || 0,
    streak: profile.streak || 0,
    createdAt: profile.created_at,
  };
};

const upsertProfile = async ({ userId, email, name, targetRole, skills }) => {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        name,
        target_role: targetRole,
        skills,
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("progress").upsert(
    {
      user_id: userId,
    },
    { onConflict: "user_id" }
  );

  return mapProfile(data);
};

const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return mapProfile(data);
};

module.exports = {
  upsertProfile,
  getProfile,
  mapProfile,
};
