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

async function updateProfile(req, res) {
  const { name, email, current_password, new_password } = req.body;

  if (!name || !email || !current_password) {
    return res.status(400).json({ success: false, message: 'Nom, email et mot de passe actuel requis.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE id = ? LIMIT 1', [req.admin.id]);
    const admin = rows[0];
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Compte introuvable.' });
    }

    const passwordMatches = await bcrypt.compare(current_password, admin.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect.' });
    }

    if (email !== admin.email) {
      const [existing] = await pool.query('SELECT id FROM admins WHERE email = ? AND id != ? LIMIT 1', [
        email,
        admin.id,
      ]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Cet email est deja utilise.' });
      }
    }

    if (new_password) {
      if (new_password.length < 8) {
        return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit faire au moins 8 caracteres.' });
      }
      const newHash = await bcrypt.hash(new_password, 10);
      await pool.query('UPDATE admins SET name = ?, email = ?, password_hash = ? WHERE id = ?', [
        name,
        email,
        newHash,
        admin.id,
      ]);
    } else {
      await pool.query('UPDATE admins SET name = ?, email = ? WHERE id = ?', [name, email, admin.id]);
    }

    const updatedAdmin = { id: admin.id, email, name };
    const token = signToken(updatedAdmin);

    return res.json({ success: true, admin: updatedAdmin, token });
  } catch (err) {
    console.error('Erreur lors de la mise a jour du profil admin:', err.message);
    return res.status(500).json({ success: false, message: 'Une erreur est survenue.' });
  }
}

module.exports = { login, me, updateProfile };
