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
    error.statusCode = error.statusCode || 500;
    error.message = `Profile setup failed: ${error.message}`;
    throw error;
  }

  const { error: progressError } = await supabase.from("progress").upsert(
    {
      user_id: userId,
    },
    { onConflict: "user_id" }
  );

  if (progressError) {
    progressError.statusCode = progressError.statusCode || 500;
    progressError.message = `Progress setup failed: ${progressError.message}`;
    throw progressError;
  }

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

const updateSkills = async ({ userId, skills }) => {
  const existingProfile = await getProfile(userId);
  const currentSkills = existingProfile?.skills || [];
  const normalized = [...currentSkills, ...(skills || [])]
    .map((skill) => String(skill).trim())
    .filter(Boolean);
  const uniqueSkills = Array.from(new Set(normalized));

  const { data, error } = await supabase
    .from("profiles")
    .update({ skills: uniqueSkills })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
};

module.exports = {
  upsertProfile,
  getProfile,
  updateSkills,
  mapProfile,
};
