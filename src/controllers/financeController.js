const pool = require('../config/db');

const VALID_TYPES = ['revenu', 'depense'];

async function list(req, res) {
  const [rows] = await pool.query('SELECT * FROM finances ORDER BY entry_date DESC, id DESC');
  return res.json({ success: true, entries: rows });
}

async function create(req, res) {
  const { type, amount, description, entry_date } = req.body;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: 'Type invalide (revenu ou depense).' });
  }
  if (!amount || Number.isNaN(Number(amount))) {
    return res.status(400).json({ success: false, message: 'Montant invalide.' });
  }
  if (!entry_date) {
    return res.status(400).json({ success: false, message: 'Date requise.' });
  }

  const [result] = await pool.query(
    'INSERT INTO finances (type, amount, description, entry_date) VALUES (?, ?, ?, ?)',
    [type, amount, description || null, entry_date]
  );

  return res.status(201).json({ success: true, id: result.insertId });
}

async function update(req, res) {
  const { id } = req.params;
  const { type, amount, description, entry_date } = req.body;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: 'Type invalide (revenu ou depense).' });
  }
  if (!amount || Number.isNaN(Number(amount))) {
    return res.status(400).json({ success: false, message: 'Montant invalide.' });
  }
  if (!entry_date) {
    return res.status(400).json({ success: false, message: 'Date requise.' });
  }

  await pool.query(
    'UPDATE finances SET type = ?, amount = ?, description = ?, entry_date = ? WHERE id = ?',
    [type, amount, description || null, entry_date, id]
  );

  return res.json({ success: true });
}

async function remove(req, res) {
  const { id } = req.params;
  await pool.query('DELETE FROM finances WHERE id = ?', [id]);
  return res.json({ success: true });
}

module.exports = { list, create, update, remove };
