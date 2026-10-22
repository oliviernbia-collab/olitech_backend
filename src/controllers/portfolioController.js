const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { VALID_ICON_KEYS } = require('../config/icons');
const { uploadDir, ALLOWED_TYPES } = require('../middleware/upload');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { validateFileSignature, uploadBufferToCloudinary, saveBufferLocally } = require('../utils/mediaUpload');

async function buildImageFields(file) {
  if (!file) return { image_url: null, image_public_id: null };

  const detected = await validateFileSignature(file.buffer, ALLOWED_TYPES);
  const resourceType = detected.mime.startsWith('video/') ? 'video' : 'image';

  if (isCloudinaryConfigured()) {
    const result = await uploadBufferToCloudinary(file.buffer, { folder: 'olitech/portfolio', resourceType });
    return { image_url: result.secure_url, image_public_id: result.public_id };
  }

  const filename = saveBufferLocally(file.buffer, uploadDir, detected.ext);
  return { image_url: `/uploads/portfolio/${filename}`, image_public_id: null };
}

function deleteImage(imageUrl, imagePublicId) {
  if (!imageUrl) return;

  if (imagePublicId) {
    // resource_type 'video' si un jour des videos sont uploadees ici (cf. upload.js).
    cloudinary.uploader.destroy(imagePublicId, { resource_type: 'image' }).catch((err) => {
      console.error("Echec de la suppression de l'image Cloudinary:", err.message);
    });
    return;
  }

  // Ancien fichier local (upload fait avant la configuration de Cloudinary).
  const filename = path.basename(imageUrl);
  const filePath = path.join(uploadDir || '', filename);
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

  try {
    const { image_url, image_public_id } = await buildImageFields(req.file);

    const [result] = await pool.query(
      'INSERT INTO portfolio_items (icon_key, title, category, description, image_url, image_public_id, link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [icon_key, title, category || null, description, image_url, image_public_id, link || null, sort_order || 0]
    );

    return res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    console.error('Erreur creation realisation:', err.message);
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 400 ? err.message : "Impossible d'enregistrer l'image pour le moment.",
    });
  }
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

  if (req.file) {
    try {
      const [existing] = await pool.query('SELECT image_url, image_public_id FROM portfolio_items WHERE id = ?', [id]);
      const { image_url, image_public_id } = await buildImageFields(req.file);
      if (existing[0]) deleteImage(existing[0].image_url, existing[0].image_public_id);

      await pool.query(
        'UPDATE portfolio_items SET icon_key = ?, title = ?, category = ?, description = ?, image_url = ?, image_public_id = ?, link = ?, sort_order = ? WHERE id = ?',
        [icon_key, title, category || null, description, image_url, image_public_id, link || null, sort_order || 0, id]
      );
    } catch (err) {
      const statusCode = err.statusCode || 500;
      console.error('Erreur mise a jour realisation:', err.message);
      return res.status(statusCode).json({
        success: false,
        message: statusCode === 400 ? err.message : "Impossible d'enregistrer l'image pour le moment.",
      });
    }
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
  const [existing] = await pool.query('SELECT image_url, image_public_id FROM portfolio_items WHERE id = ?', [id]);
  if (existing[0]) deleteImage(existing[0].image_url, existing[0].image_public_id);
  await pool.query('DELETE FROM portfolio_items WHERE id = ?', [id]);
  return res.json({ success: true });
}

module.exports = { list, create, update, remove };
