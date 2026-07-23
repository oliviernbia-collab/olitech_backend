const pool = require('../config/db');
const { VALID_ICON_KEYS } = require('../config/icons');

async function list(req, res) {
  const [rows] = await pool.query('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
  return res.json({ success: true, services: rows });
}

async function create(req, res) {
  const { icon_key, title, subtitle, description, sort_order } = req.body;

  if (!icon_key || !VALID_ICON_KEYS.includes(icon_key)) {
    return res.status(400).json({ success: false, message: 'Icone invalide.' });
  }
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Titre et description requis.' });
  }

  const [result] = await pool.query(
    'INSERT INTO services (icon_key, title, subtitle, description, sort_order) VALUES (?, ?, ?, ?, ?)',
    [icon_key, title, subtitle || null, description, sort_order || 0]
  );

  return res.status(201).json({ success: true, id: result.insertId });
}

async function update(req, res) {
  const { id } = req.params;
  const { icon_key, title, subtitle, description, sort_order } = req.body;

  if (!icon_key || !VALID_ICON_KEYS.includes(icon_key)) {
    return res.status(400).json({ success: false, message: 'Icone invalide.' });
  }
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Titre et description requis.' });
  }

  await pool.query(
    'UPDATE services SET icon_key = ?, title = ?, subtitle = ?, description = ?, sort_order = ? WHERE id = ?',
    [icon_key, title, subtitle || null, description, sort_order || 0, id]
  );

  return res.json({ success: true });
}

async function remove(req, res) {
  const { id } = req.params;
  await pool.query('DELETE FROM services WHERE id = ?', [id]);
  return res.json({ success: true });
}

module.exports = { list, create, update, remove };
