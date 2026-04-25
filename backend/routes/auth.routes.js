const express = require("express");

const router = express.Router();

// Supabase handles signup/login on the frontend.
// This route confirms that the backend accepted the JWT.
router.get("/me", (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  });
});

module.exports = router;
