const express = require("express");
const router = express.Router();
const multer = require("multer");
const { checkIn, checkOut } = require("../controllers/attendanceController");
const authMiddleware = require("../middlewares/authMiddleware");

// Konfigurasi Multer untuk menyimpan foto ke folder 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Endpoint Presensi (Dilindungi oleh authMiddleware)
router.post("/checkin", authMiddleware, upload.single("photo"), checkIn);
router.post("/checkout", authMiddleware, checkOut);

module.exports = router;
