const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. REGISTRASI (Untuk menambahkan karyawan / admin pertama)
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Cek apakah email sudah terdaftar
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah digunakan!" });
    }

    // Enkripsi (Hash) password demi keamanan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan ke database Supabase
    const newUser = await pool.query("INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role", [name, email, hashedPassword, role || "karyawan"]);

    res.status(201).json({
      message: "Registrasi berhasil!",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. LOGIN KARYAWAN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Cari user berdasarkan email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email atau password salah!" });
    }

    const user = result.rows[0];

    // Cek apakah password yang diinput cocok dengan di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email atau password salah!" });
    }

    // Jika cocok, buat JWT Token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // Token ini ibarat "KTP Digital" yang berlaku 1 hari
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) throw err;
      res.json({
        message: "Login berhasil",
        token: token,
        role: user.role,
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
