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

// 2. AMBIL SEMUA PENGAJUAN CUTI (Khusus HR/Admin)
exports.getAllLeaves = async (req, res) => {
  // Pastikan hanya HR atau Admin yang bisa mengakses ini
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ success: false, message: "Akses ditolak! Khusus HR/Admin." });
  }

  try {
    // Ambil data cuti beserta nama karyawan yang mengajukan (JOIN table)
    const result = await pool.query(`
            SELECT l.*, u.name as employee_name 
            FROM leave_requests l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.date DESC
        `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. UBAH STATUS CUTI (Approve / Reject)
exports.updateLeaveStatus = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "hr") {
    return res.status(403).json({ success: false, message: "Akses ditolak! Khusus HR/Admin." });
  }

  const leaveId = req.params.id; // ID pengajuan cuti dari URL
  const { status } = req.body; // 'approved' atau 'rejected'

  try {
    const result = await pool.query("UPDATE leave_requests SET status = $1 WHERE id = $2 RETURNING *", [status, leaveId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Data pengajuan tidak ditemukan!" });
    }

    res.json({ success: true, message: `Pengajuan berhasil di-${status}!`, data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
