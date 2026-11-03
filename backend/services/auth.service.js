const { supabaseAdmin, supabaseAuthClient } = require("../config/supabase");
const profileService = require("./profile.service");

const getAccessToken = (session) => {
  return session?.access_token || "";
};

const getAuthError = (error) => {
  if (error?.message === "fetch failed") {
    const authError = new Error(
      "Unable to reach Supabase Auth. Verify SUPABASE_URL and SUPABASE_ANON_KEY on the server."
    );
    authError.statusCode = 502;
    return authError;
  }

  if (
    error?.code === "user_already_exists" ||
    /already registered|already exists/i.test(error?.message || "")
  ) {
    error.statusCode = 409;
    error.message = "An account with this email already exists. Please log in.";
    return error;
  }

  if (
    error?.code === "email_not_confirmed" ||
    /email not confirmed/i.test(error?.message || "")
  ) {
    error.statusCode = 403;
    error.message =
      "Please confirm your email using the link from Supabase, then try logging in again.";
    return error;
  }

  if (
    error?.code === "over_email_send_rate_limit" ||
    /email rate limit exceeded|rate limit.*email/i.test(error?.message || "")
  ) {
    error.statusCode = 429;
    error.message =
      "Supabase temporarily limited confirmation emails. Please wait a few minutes before trying again.";
    return error;
  }

  error.statusCode = error.statusCode || error.status || 502;
  return error;
};

const signup = async ({ email, password, name, targetRole, skills }) => {
  let data;
  let error;

  try {
    ({ data, error } = await supabaseAuthClient.auth.signUp({
      email,
      password,
    }));
  } catch (requestError) {
    throw getAuthError(requestError);
  }

  if (error) {
    throw getAuthError(error);
  }

  if (!data.user) {
    const signupError = new Error("Signup failed");
    signupError.statusCode = 400;
    throw signupError;
  }

  // Supabase can return a masked user instead of an error when the email
  // already exists and email confirmation is enabled.
  if (data.user.identities && data.user.identities.length === 0) {
    const duplicateError = new Error(
      "An account with this email already exists. Please log in."
    );
    duplicateError.statusCode = 409;
    throw duplicateError;
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
  let data;
  let error;

  try {
    ({ data, error } = await supabaseAuthClient.auth.signInWithPassword({
      email,
      password,
    }));
  } catch (requestError) {
    throw getAuthError(requestError);
  }

  if (error) {
    throw getAuthError({
      ...error,
      statusCode: 401,
    });
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
