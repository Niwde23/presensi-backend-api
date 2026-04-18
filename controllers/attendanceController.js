const pool = require("../config/db");

// Koordinat Pusat Kantor (Contoh: Monas, Jakarta)
// Nanti bisa kamu ganti dengan koordinat kampus atau tempat lain
const OFFICE_LAT = -6.1753924;
const OFFICE_LONG = 106.8271528;
const MAX_RADIUS = 50; // Jarak maksimal dalam meter (misal: 50 meter)

// Fungsi menghitung jarak GPS (Rumus Haversine)
function hitungJarak(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius bumi dalam meter
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Hasil dalam meter
}

// 1. CHECK-IN
exports.checkIn = async (req, res) => {
  const { lat, long } = req.body;
  const userId = req.user.id;
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Validasi Jarak
    const jarak = hitungJarak(OFFICE_LAT, OFFICE_LONG, parseFloat(lat), parseFloat(long));
    if (jarak > MAX_RADIUS) {
      return res.status(400).json({ message: `Anda berada di luar jangkauan kantor! Jarak Anda: ${Math.round(jarak)} meter.` });
    }

    // Cek apakah hari ini sudah absen masuk
    const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
    const cekAbsen = await pool.query("SELECT * FROM attendance WHERE user_id = $1 AND DATE(check_in) = $2", [userId, today]);

    if (cekAbsen.rows.length > 0) {
      return res.status(400).json({ message: "Anda sudah melakukan Check-In hari ini!" });
    }

    // Simpan ke database
    const result = await pool.query("INSERT INTO attendance (user_id, check_in, lat, long, photo_url) VALUES ($1, NOW(), $2, $3, $4) RETURNING *", [userId, lat, long, photoUrl]);

    res.status(201).json({ message: "Check-In berhasil!", data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. CHECK-OUT
exports.checkOut = async (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split("T")[0];

  try {
    // Cari absen hari ini
    const absenHariIni = await pool.query("SELECT * FROM attendance WHERE user_id = $1 AND DATE(check_in) = $2", [userId, today]);

    if (absenHariIni.rows.length === 0) {
      return res.status(400).json({ message: "Anda belum Check-In hari ini!" });
    }

    if (absenHariIni.rows[0].check_out !== null) {
      return res.status(400).json({ message: "Anda sudah Check-Out hari ini!" });
    }

    // Update jam check-out
    const result = await pool.query("UPDATE attendance SET check_out = NOW() WHERE id = $1 RETURNING *", [absenHariIni.rows[0].id]);

    res.json({ message: "Check-Out berhasil!", data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
