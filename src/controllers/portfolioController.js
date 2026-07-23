const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { VALID_ICON_KEYS } = require('../config/icons');
const { uploadDir } = require('../middleware/upload');

function deleteImageFile(imageUrl) {
  if (!imageUrl) return;
  const filename = path.basename(imageUrl);
  const filePath = path.join(uploadDir, filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error("Echec de la suppression de l'image:", err.message);
    }
  });
}

async function list(req, res) {
  const [rows] = await pool.query('SELECT * FROM portfolio_items ORDER BY sort_order ASC, id ASC');
  return res.json({ success: true, items: rows });
}

async function create(req, res) {
  const { icon_key, title, category, description, link, sort_order } = req.body;

  if (!icon_key || !VALID_ICON_KEYS.includes(icon_key)) {
    return res.status(400).json({ success: false, message: 'Icone invalide.' });
  }
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Titre et description requis.' });
  }

  const image_url = req.file ? `/uploads/portfolio/${req.file.filename}` : null;

  const [result] = await pool.query(
    'INSERT INTO portfolio_items (icon_key, title, category, description, image_url, link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [icon_key, title, category || null, description, image_url, link || null, sort_order || 0]
  );

  return res.status(201).json({ success: true, id: result.insertId });
}

async function update(req, res) {
  const { id } = req.params;
  const { icon_key, title, category, description, link, sort_order } = req.body;

  if (!icon_key || !VALID_ICON_KEYS.includes(icon_key)) {
    return res.status(400).json({ success: false, message: 'Icone invalide.' });
  }
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Titre et description requis.' });
  }

  let image_url;
  if (req.file) {
    const [existing] = await pool.query('SELECT image_url FROM portfolio_items WHERE id = ?', [id]);
    if (existing[0]) deleteImageFile(existing[0].image_url);
    image_url = `/uploads/portfolio/${req.file.filename}`;

    await pool.query(
      'UPDATE portfolio_items SET icon_key = ?, title = ?, category = ?, description = ?, image_url = ?, link = ?, sort_order = ? WHERE id = ?',
      [icon_key, title, category || null, description, image_url, link || null, sort_order || 0, id]
    );
  } else {
    await pool.query(
      'UPDATE portfolio_items SET icon_key = ?, title = ?, category = ?, description = ?, link = ?, sort_order = ? WHERE id = ?',
      [icon_key, title, category || null, description, link || null, sort_order || 0, id]
    );
  }

  return res.json({ success: true });
}

async function remove(req, res) {
  const { id } = req.params;
  const [existing] = await pool.query('SELECT image_url FROM portfolio_items WHERE id = ?', [id]);
  if (existing[0]) deleteImageFile(existing[0].image_url);
  await pool.query('DELETE FROM portfolio_items WHERE id = ?', [id]);
  return res.json({ success: true });
}

module.exports = { list, create, update, remove };
