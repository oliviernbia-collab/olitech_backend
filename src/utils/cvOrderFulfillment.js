const pool = require('../config/db');
const { generatePdf } = require('./cvPdfGenerator');
const { sendCvOrderPaidEmail } = require('./mailer');

// Marque une commande payee, genere le PDF et envoie l'email de telechargement.
// Utilise a la fois par le webhook Jeko (paiement reel) et par l'action admin
// "Marquer paye manuellement" (banc de test sans dependance a Jeko) — dans ce
// second cas, manualByEmail trace quel admin a declenche le contournement.
async function finalizeOrderPayment(orderReference, manualByEmail = null) {
  const [rows] = await pool.query(
    `SELECT co.*, ct.layout_key, ct.palette_key
     FROM cv_orders co JOIN cv_templates ct ON ct.id = co.template_id
     WHERE co.order_reference = ? LIMIT 1`,
    [orderReference]
  );
  const order = rows[0];
  if (!order || order.status === 'paid') return order;

  const pdfRelativePath = await generatePdf(order, {
    layout_key: order.layout_key,
    palette_key: order.palette_key,
  });

  if (manualByEmail) {
    await pool.query(
      `UPDATE cv_orders SET status = 'paid', pdf_path = ?, generated_at = NOW(),
         paid_manually_by = ?, paid_manually_at = NOW() WHERE id = ?`,
      [pdfRelativePath, manualByEmail, order.id]
    );
  } else {
    await pool.query(
      `UPDATE cv_orders SET status = 'paid', pdf_path = ?, generated_at = NOW() WHERE id = ?`,
      [pdfRelativePath, order.id]
    );
  }

  const downloadUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cv/suivi/${order.order_reference}`;
  sendCvOrderPaidEmail(order, downloadUrl)
    .then(() => pool.query('UPDATE cv_orders SET email_sent_at = NOW() WHERE id = ?', [order.id]))
    .catch((err) => console.error("Echec de l'envoi de l'email CV:", err.message));

  return order;
}

module.exports = { finalizeOrderPayment };
