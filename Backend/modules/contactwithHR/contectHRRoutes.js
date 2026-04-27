const express = require("express");
const router = express.Router();
const { createRequest, getRequests, getRequestById, updateRequestStatus } = require("./contectHRController");
const authenticateToken = require("../../middlewares/authMiddleware");

// Employee submits request
router.post("/", createRequest);

// HR gets all requests
router.get("/", getRequests);

// HR gets single request
router.get("/:id", getRequestById);

// HR updates request status
router.patch("/:id/status", authenticateToken, updateRequestStatus);

module.exports = router;
