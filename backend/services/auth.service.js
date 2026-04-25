const { supabaseAdmin, supabaseAuthClient } = require("../config/supabase");
const profileService = require("./profile.service");

const getAccessToken = (session) => {
  return session?.access_token || "";
};

const signup = async ({ email, password, name, targetRole, skills }) => {
  const { data, error } = await supabaseAuthClient.auth.signUp({
    email,
    password,
  });

  if (error) {
    error.statusCode = 400;
    throw error;
  }

  if (!data.user) {
    const signupError = new Error("Signup failed");
    signupError.statusCode = 400;
    throw signupError;
  }

  await profileService.upsertProfile({
    userId: data.user.id,
    email: data.user.email,
    name,
    targetRole,
    skills,
  });

  return {
    message: "Signup successful",
    user: data.user,
    session: data.session,
    accessToken: getAccessToken(data.session),
  };
};

const login = async ({ email, password }) => {
  const { data, error } = await supabaseAuthClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    error.statusCode = 401;
    throw error;
  }

  return {
    message: "Login successful",
    user: data.user,
    session: data.session,
    accessToken: getAccessToken(data.session),
  };
};

const getMe = async (userId) => {
  const profile = await profileService.getProfile(userId);

  return {
    profile,
  };
};

const logout = async () => {
  // Supabase JWT logout is handled on the frontend by deleting local storage.
  return {
    message: "Logout successful",
  };
};

module.exports = {
  signup,
  login,
  getMe,
  logout,
};
