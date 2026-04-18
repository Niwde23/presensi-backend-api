const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// + Agar foto di dalam folder 'uploads' bisa diakses publik (seperti url gambar)
app.use("/uploads", express.static("uploads"));

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes"); // + Import routes presensi

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes); // + Daftarkan rute presensi

app.get("/", (req, res) => {
  res.json({ message: "API Sistem Presensi Berjalan Lancar!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
