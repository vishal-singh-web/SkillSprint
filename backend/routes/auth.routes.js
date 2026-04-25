const express = require("express");
const requireAuth = require("../middleware/auth.middleware");
const { signup, login, logout, me } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);

module.exports = router;
