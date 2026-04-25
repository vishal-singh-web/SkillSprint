const express = require("express");
const {
  createOrUpdateProfile,
  getProfile,
} = require("../controllers/profile.controller");

const router = express.Router();

router.post("/", createOrUpdateProfile);
router.get("/", getProfile);

module.exports = router;
