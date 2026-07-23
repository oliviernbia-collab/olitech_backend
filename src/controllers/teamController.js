const pool = require('../config/db');

async function list(req, res) {
  const [rows] = await pool.query('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC');
  return res.json({ success: true, members: rows });
}

async function create(req, res) {
  const { name, role, bio, sort_order } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Le nom est requis.' });
  }

  const [result] = await pool.query(
    'INSERT INTO team_members (name, role, bio, sort_order) VALUES (?, ?, ?, ?)',
    [name, role || null, bio || null, sort_order || 0]
  );

  return res.status(201).json({ success: true, id: result.insertId });
}

async function update(req, res) {
  const { id } = req.params;
  const { name, role, bio, sort_order } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Le nom est requis.' });
  }

  await pool.query(
    'UPDATE team_members SET name = ?, role = ?, bio = ?, sort_order = ? WHERE id = ?',
    [name, role || null, bio || null, sort_order || 0, id]
  );

  return res.json({ success: true });
}

async function remove(req, res) {
  const { id } = req.params;
  await pool.query('DELETE FROM team_members WHERE id = ?', [id]);
  return res.json({ success: true });
}

module.exports = { list, create, update, remove };
