const pool = require("../config/db");

exports.submitLeave = async (req, res) => {
  // Ambil data yang dikirim dari aplikasi HP
  const { type, date, reason } = req.body;
  const userId = req.user.id; // Diambil dari Token KTP Digital

  try {
    // Simpan ke database (tabel leave_requests sudah kita buat di Tahap 1)
    const result = await pool.query("INSERT INTO leave_requests (user_id, type, date, reason, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *", [userId, type, date, reason]);

    res.status(201).json({
      success: true,
      message: "Pengajuan berhasil dikirim dan menunggu persetujuan HR!",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error saat mengajukan cuti" });
  }
};
