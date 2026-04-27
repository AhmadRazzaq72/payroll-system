const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middlewares/authMiddleware");
const { createAnnouncement, getAnnouncements, updateAnnouncement } = require("./announcements.controller");

router.get("/announcements", getAnnouncements);
router.post("/announcements", authenticateToken, createAnnouncement);
router.put("/announcements/:id", authenticateToken, updateAnnouncement);

module.exports = router;
