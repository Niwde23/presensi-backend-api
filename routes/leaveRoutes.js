const express = require("express");
const router = express.Router();
const { submitLeave, getAllLeaves, updateLeaveStatus } = require("../controllers/leaveController");
const authMiddleware = require("../middlewares/authMiddleware");

// Endpoint: POST /api/leave/request
router.post("/request", authMiddleware, submitLeave);

// Endpoint: GET /api/leave/all (Melihat semua pengajuan)
router.get("/all", authMiddleware, getAllLeaves);

// Endpoint: PUT /api/leave/update/:id (Mengubah status pengajuan)
router.put("/update/:id", authMiddleware, updateLeaveStatus);

module.exports = router;
