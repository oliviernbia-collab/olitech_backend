const axios = require('axios');
const {
  JEKO_API_BASE_URL,
  JEKO_API_KEY,
  JEKO_API_KEY_ID,
  isJekoConfigured,
} = require('../config/jeko');

class JekoNotConfiguredError extends Error {
  constructor() {
    super('Jeko non configure (cles API manquantes).');
    this.name = 'JekoNotConfiguredError';
  }
}

function client() {
  if (!isJekoConfigured()) {
    throw new JekoNotConfiguredError();
  }
  return axios.create({
    baseURL: JEKO_API_BASE_URL,
    headers: {
      'X-API-KEY': JEKO_API_KEY,
      'X-API-KEY-ID': JEKO_API_KEY_ID,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });
}

async function createPaymentRequest({ storeId, amountCents, currency, reference, paymentMethod, successUrl, errorUrl }) {
  const res = await client().post('/partner_api/payment_requests', {
    storeId,
    amountCents,
    currency,
    reference,
    paymentDetails: {
      type: 'redirect',
      data: { paymentMethod, successUrl, errorUrl },
    },
  });
  return res.data;
}

async function getPaymentRequest(id) {
  const res = await client().get(`/partner_api/payment_requests/${id}`);
  return res.data;
}

async function listStores() {
  const res = await client().get('/partner_api/stores');
  return res.data;
}

module.exports = { createPaymentRequest, getPaymentRequest, listStores, JekoNotConfiguredError };
