// Utilitaire a lancer une fois les cles Jeko fournies :
// affiche les magasins (storeId) disponibles pour JEKO_STORE_ID dans .env
//   npm run jeko:stores
require('dotenv').config();
const axios = require('axios');
const { JEKO_API_BASE_URL, JEKO_API_KEY, JEKO_API_KEY_ID } = require('../src/config/jeko');

async function main() {
  if (!JEKO_API_KEY || !JEKO_API_KEY_ID) {
    console.error('JEKO_API_KEY et JEKO_API_KEY_ID doivent etre definis dans .env avant de lancer ce script.');
    process.exit(1);
  }

  try {
    // Appel direct (sans passer par jekoClient, qui exige aussi JEKO_STORE_ID —
    // la valeur qu'on cherche justement a obtenir ici).
    const res = await axios.get(`${JEKO_API_BASE_URL}/partner_api/stores`, {
      headers: { 'X-API-KEY': JEKO_API_KEY, 'X-API-KEY-ID': JEKO_API_KEY_ID },
    });
    const stores = res.data;
    console.log('Magasins disponibles :');
    console.log(JSON.stringify(stores, null, 2));
  } catch (err) {
    console.error('Erreur lors de la recuperation des magasins:', err.response?.data || err.message);
    process.exit(1);
  }
}

main();
