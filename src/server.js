const app = require('./app');
require('dotenv').config();
const { checkStalePendingOrders } = require('./utils/staleOrderChecker');

const PORT = process.env.PORT || 5000;
const STALE_CHECK_INTERVAL_MS = 15 * 60 * 1000;

app.listen(PORT, () => {
  console.log(`Serveur OliTech backend demarre sur le port ${PORT}`);
});

setInterval(() => {
  checkStalePendingOrders().catch((err) =>
    console.error('Echec de la verification des commandes en attente:', err.message)
  );
}, STALE_CHECK_INTERVAL_MS);
