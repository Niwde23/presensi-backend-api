const express = require("express");
const router = express.Router();
const { submitLeave } = require("../controllers/leaveController");
const authMiddleware = require("../middlewares/authMiddleware");

// Endpoint: POST /api/leave/request
router.post("/request", authMiddleware, submitLeave);

module.exports = router;
