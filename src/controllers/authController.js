const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { signToken } = require('../utils/jwt');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ? LIMIT 1', [email]);
    const admin = rows[0];

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const token = signToken(admin);
    return res.json({
      success: true,
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    console.error('Erreur lors de la connexion admin:', err.message);
    return res.status(500).json({ success: false, message: 'Une erreur est survenue.' });
  }
}

async function me(req, res) {
  return res.json({ success: true, admin: req.admin });
}

module.exports = { login, me };
