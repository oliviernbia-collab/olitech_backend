const pool = require('../config/db');
const { sendStalePendingOrderAlert } = require('./mailer');

const STALE_THRESHOLD_MINUTES = 30;

// Alerte l'admin quand une commande reste "pending_payment" trop longtemps :
// cas ou le client a paye mais ou le webhook Jeko n'a jamais atteint le
// serveur (panne, mauvaise URL cote Jeko, etc.). stale_alert_sent_at evite
// de renvoyer la meme alerte a chaque execution.
async function checkStalePendingOrders() {
  const [rows] = await pool.query(
    `SELECT * FROM cv_orders
     WHERE status = 'pending_payment'
       AND stale_alert_sent_at IS NULL
       AND created_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
    [STALE_THRESHOLD_MINUTES]
  );

  for (const order of rows) {
    try {
      await sendStalePendingOrderAlert(order);
      await pool.query('UPDATE cv_orders SET stale_alert_sent_at = NOW() WHERE id = ?', [order.id]);
    } catch (err) {
      console.error(`Echec de l'alerte commande en attente (${order.order_reference}):`, err.message);
    }
  }
}

module.exports = { checkStalePendingOrders, STALE_THRESHOLD_MINUTES };
