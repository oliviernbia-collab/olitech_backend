const pool = require('../config/db');

async function listPublic(req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM cv_templates WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );
  return res.json({ success: true, templates: rows });
}

async function listAdmin(req, res) {
  const [rows] = await pool.query('SELECT * FROM cv_templates ORDER BY sort_order ASC, id ASC');
  return res.json({ success: true, templates: rows });
}

async function getBySlug(req, res) {
  const { slug } = req.params;
  const [rows] = await pool.query(
    'SELECT * FROM cv_templates WHERE slug = ? AND is_active = 1 LIMIT 1',
    [slug]
  );
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Modele introuvable.' });
  }
  return res.json({ success: true, template: rows[0] });
}

async function update(req, res) {
  const { id } = req.params;
  const { name, description, price_fcfa, is_active, sort_order } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Nom requis.' });
  }

  const price = price_fcfa === undefined || price_fcfa === null || price_fcfa === '' ? 300 : Number(price_fcfa);
  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({ success: false, message: 'Prix invalide.' });
  }

  await pool.query(
    'UPDATE cv_templates SET name = ?, description = ?, price_fcfa = ?, is_active = ?, sort_order = ? WHERE id = ?',
    [name, description || null, price, is_active ? 1 : 0, sort_order || 0, id]
  );

  return res.json({ success: true });
}

module.exports = { listPublic, listAdmin, getBySlug, update };
