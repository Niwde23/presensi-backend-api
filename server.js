const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Agar bisa membaca body request format JSON

// Tes Route Dasar
app.get("/", (req, res) => {
  res.json({ message: "API Sistem Presensi Berjalan Lancar!" });
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
