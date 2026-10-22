const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { outputRoot } = require('../utils/cvPdfGenerator');
const { finalizeOrderPayment } = require('../utils/cvOrderFulfillment');
const { isCloudinaryConfigured } = require('../config/cloudinary');
const { ALLOWED_TYPES: ALLOWED_PHOTO_TYPES, uploadDir: photoUploadDir } = require('../middleware/uploadCvPhoto');
const { validateFileSignature, uploadBufferToCloudinary, saveBufferLocally } = require('../utils/mediaUpload');

async function getTemplateById(id) {
  const [rows] = await pool.query('SELECT * FROM cv_templates WHERE id = ? AND is_active = 1 LIMIT 1', [id]);
  return rows[0] || null;
}

async function create(req, res) {
  const { template_id, buyer_name, buyer_email, buyer_phone } = req.body;

  try {
    const template = await getTemplateById(template_id);
    if (!template) {
      return res.status(400).json({ success: false, message: 'Modele invalide ou indisponible.' });
    }

    let formData;
    try {
      formData = JSON.parse(req.body.form_data);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Contenu du CV invalide.' });
    }

    const orderReference = crypto.randomBytes(16).toString('hex');
    let photoPath = null;
    let photoPublicId = null;
    if (req.file) {
      const detected = await validateFileSignature(req.file.buffer, ALLOWED_PHOTO_TYPES);

      if (isCloudinaryConfigured()) {
        const result = await uploadBufferToCloudinary(req.file.buffer, {
          folder: 'olitech/cv-photos',
          resourceType: 'image',
        });
        photoPath = result.secure_url;
        photoPublicId = result.public_id;
      } else {
        const filename = saveBufferLocally(req.file.buffer, photoUploadDir, detected.ext);
        photoPath = `/uploads/cv-photos/${filename}`;
      }
    }

    const [result] = await pool.query(
      `INSERT INTO cv_orders
        (order_reference, template_id, buyer_name, buyer_email, buyer_phone, photo_path, photo_public_id, form_data, amount_fcfa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderReference,
        template.id,
        buyer_name,
        buyer_email,
        buyer_phone || null,
        photoPath,
        photoPublicId,
        JSON.stringify(formData),
        template.price_fcfa,
      ]
    );

    return res.status(201).json({ success: true, id: result.insertId, order_reference: orderReference });
  } catch (err) {
    console.error('Erreur lors de la creation de la commande CV:', err.message);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 400 ? err.message : 'Une erreur est survenue, veuillez reessayer.',
    });
  }
}

async function getByReference(req, res) {
  const { reference } = req.params;
  const [rows] = await pool.query(
    `SELECT co.order_reference, co.status, co.buyer_name, co.generated_at, ct.name AS template_name
     FROM cv_orders co JOIN cv_templates ct ON ct.id = co.template_id
     WHERE co.order_reference = ? LIMIT 1`,
    [reference]
  );
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Commande introuvable.' });
  }
  return res.json({ success: true, order: rows[0] });
}

async function listAdmin(req, res) {
  const [rows] = await pool.query(
    `SELECT co.*, ct.name AS template_name
     FROM cv_orders co JOIN cv_templates ct ON ct.id = co.template_id
     ORDER BY co.created_at DESC`
  );
  return res.json({ success: true, orders: rows });
}

async function getAdmin(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT co.*, ct.name AS template_name
     FROM cv_orders co JOIN cv_templates ct ON ct.id = co.template_id
     WHERE co.id = ? LIMIT 1`,
    [id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Commande introuvable.' });
  }
  return res.json({ success: true, order: rows[0] });
}

async function markPaidManually(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT order_reference FROM cv_orders WHERE id = ? LIMIT 1', [id]);
    const order = rows[0];
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    await finalizeOrderPayment(order.order_reference, req.admin?.email || 'admin');
    return res.json({ success: true });
  } catch (err) {
    console.error('Erreur lors du marquage paye / generation PDF:', err.message);
    return res.status(500).json({ success: false, message: 'Impossible de generer le PDF pour le moment.' });
  }
}

async function download(req, res) {
  const { reference } = req.params;

  const [rows] = await pool.query(
    'SELECT * FROM cv_orders WHERE order_reference = ? LIMIT 1',
    [reference]
  );
  const order = rows[0];

  if (!order || order.status !== 'paid' || !order.pdf_path) {
    return res.status(404).json({ success: false, message: 'Fichier non disponible.' });
  }

  const absolutePath = path.join(outputRoot, order.pdf_path);
  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ success: false, message: 'Fichier non disponible.' });
  }

  return res.download(absolutePath, 'cv-olitech.pdf');
}

module.exports = { create, getByReference, listAdmin, getAdmin, markPaidManually, download };
