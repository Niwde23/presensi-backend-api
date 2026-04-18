const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db"); // 👈 Tambahkan baris ini agar database terkoneksi!

const app = express();

app.use(cors());
app.use(express.json());

// Import Routes (Kita akan buat file-nya setelah ini)
const authRoutes = require("./routes/authRoutes");

// Daftarkan Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Sistem Presensi Berjalan Lancar!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
