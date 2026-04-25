const supabase = require("../config/supabase");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing Authorization Bearer token",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Every protected controller can safely use req.user.id.
    req.user = data.user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireAuth;
