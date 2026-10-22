const pool = require('../config/db');
const { JEKO_STORE_ID, isJekoConfigured } = require('../config/jeko');
const { createPaymentRequest } = require('../utils/jekoClient');
const { verifySignature } = require('../utils/jekoWebhook');
const { finalizeOrderPayment } = require('../utils/cvOrderFulfillment');

const VALID_METHODS = ['wave', 'orange', 'mtn', 'moov'];

async function initiate(req, res) {
  const { id } = req.params;
  const { payment_method } = req.body;

  if (!VALID_METHODS.includes(payment_method)) {
    return res.status(400).json({ success: false, message: 'Moyen de paiement invalide.' });
  }

  if (!isJekoConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Le paiement en ligne est temporairement indisponible. Votre commande est bien enregistree, reessayez plus tard.',
    });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM cv_orders WHERE id = ? LIMIT 1', [id]);
    const order = rows[0];
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }
    if (order.status === 'paid') {
      return res.status(409).json({ success: false, message: 'Cette commande est deja payee.' });
    }

    const amountCents = Math.round(Number(order.amount_fcfa) * 100);
    // PUBLIC_API_URL (HTTPS, ex. tunnel ngrok en dev) sert de base aux URL de
    // redirection exigees par Jeko ; /cv-redirect rebondit ensuite vers FRONTEND_URL.
    const publicApiUrl = process.env.PUBLIC_API_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    const ref = encodeURIComponent(order.order_reference);
    const successUrl = `${publicApiUrl}/cv-redirect?status=success&ref=${ref}`;
    const errorUrl = `${publicApiUrl}/cv-redirect?status=error&ref=${ref}`;

    const response = await createPaymentRequest({
      storeId: JEKO_STORE_ID,
      amountCents,
      currency: 'XOF',
      reference: order.order_reference,
      paymentMethod: payment_method,
      successUrl,
      errorUrl,
    });

    await pool.query(
      `INSERT INTO cv_payments
        (order_id, reference, jeko_payment_request_id, payment_method, amount_cents, currency, status, raw_request, raw_response)
       VALUES (?, ?, ?, ?, ?, 'XOF', ?, ?, ?)`,
      [
        order.id,
        order.order_reference,
        response.id,
        payment_method,
        amountCents,
        response.status || 'pending',
        JSON.stringify({ amountCents, paymentMethod: payment_method, successUrl, errorUrl }),
        JSON.stringify(response),
      ]
    );

    return res.json({ success: true, redirectUrl: response.redirectUrl });
  } catch (err) {
    console.error('Erreur initiation paiement Jeko:', err.response?.data || err.message);
    return res.status(502).json({
      success: false,
      message: 'Impossible de contacter le service de paiement pour le moment.',
    });
  }
}

async function handleWebhook(req, res) {
  const signature = req.header('Jeko-Signature');
  const rawBody = req.body; // Buffer, grace a express.raw() sur cette route

  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ success: false, message: 'Signature invalide.' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Payload invalide.' });
  }

  // Repond vite, traite ensuite (Jeko tolere jusqu'a 3 tentatives mais attend un 200 rapide).
  res.status(200).json({ received: true });

  const eventHeader = req.header('Jeko-Event');
  if (eventHeader && eventHeader !== 'TRANSACTION_COMPLETED') return;
  if (payload.transactionType && payload.transactionType !== 'payment') return;

  const reference = payload.transactionDetails?.reference;
  const jekoId = payload.id;
  if (!reference && !jekoId) return;

  // Transaction + verrou de ligne (FOR UPDATE) : si deux notifications arrivent
  // en parallele pour le meme paiement, la seconde attend que la premiere ait
  // commite avant de lire le statut, donc elle le voit deja a jour (idempotence
  // garantie meme sous vrai parallelisme, pas seulement sous retries sequentiels).
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      reference
        ? 'SELECT * FROM cv_payments WHERE reference = ? LIMIT 1 FOR UPDATE'
        : 'SELECT * FROM cv_payments WHERE jeko_payment_request_id = ? LIMIT 1 FOR UPDATE',
      [reference || jekoId]
    );
    const payment = rows[0];

    if (!payment || payment.status === 'success') {
      // Rien a faire, ou deja traite par une notification precedente.
      await conn.commit();
      return;
    }

    await conn.query(
      'UPDATE cv_payments SET status = ?, webhook_payload = ? WHERE id = ?',
      [payload.status, JSON.stringify(payload), payment.id]
    );

    if (payload.status === 'error') {
      await conn.query(
        `UPDATE cv_orders SET status = 'failed' WHERE order_reference = ? AND status != 'paid'`,
        [payment.reference]
      );
    }

    await conn.commit();

    // Genere le PDF et envoie l'email APRES avoir libere le verrou de ligne
    // (operation longue : Puppeteer, SMTP — ne doit pas bloquer d'autres webhooks).
    if (payload.status === 'success') {
      await finalizeOrderPayment(payment.reference);
    }
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error('Erreur traitement webhook Jeko:', err.message);
  } finally {
    conn.release();
  }
}

module.exports = { initiate, handleWebhook };
