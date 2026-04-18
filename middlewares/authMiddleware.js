const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  // Ambil token dari header request
  const token = req.header("Authorization");

  // Jika tidak ada token, tolak aksesnya
  if (!token) {
    return res.status(401).json({ message: "Akses ditolak, token tidak ditemukan!" });
  }

  try {
    // Hilangkan kata "Bearer " jika ada
    const finalToken = token.replace("Bearer ", "");

    // Verifikasi token
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
    req.user = decoded.user; // Masukkan data user ke dalam request
    next(); // Lanjut ke controller presensi
  } catch (err) {
    res.status(401).json({ message: "Token tidak valid!" });
  }
};
