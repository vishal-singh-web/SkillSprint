const authService = require("../services/auth.service");

const signup = async (req, res, next) => {
  try {
    const { email, password, name, targetRole, skills } = req.body;

    if (!email || !password || !name || !targetRole || !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "email, password, name, targetRole, and skills are required",
      });
    }

    const result = await authService.signup({
      email,
      password,
      name,
      targetRole,
      skills,
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const result = await authService.login({ email, password });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const result = await authService.logout();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const result = await authService.getMe(req.user.id);

    return res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
      },
      profile: result.profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  me,
};
