require('dotenv').config();

const JEKO_API_BASE_URL = process.env.JEKO_API_BASE_URL || 'https://api.jeko.africa';
const JEKO_API_KEY = process.env.JEKO_API_KEY || '';
const JEKO_API_KEY_ID = process.env.JEKO_API_KEY_ID || '';
const JEKO_STORE_ID = process.env.JEKO_STORE_ID || '';
const JEKO_WEBHOOK_SECRET = process.env.JEKO_WEBHOOK_SECRET || '';

function isJekoConfigured() {
  return Boolean(JEKO_API_KEY && JEKO_API_KEY_ID && JEKO_STORE_ID);
}

function isWebhookConfigured() {
  return Boolean(JEKO_WEBHOOK_SECRET);
}

module.exports = {
  JEKO_API_BASE_URL,
  JEKO_API_KEY,
  JEKO_API_KEY_ID,
  JEKO_STORE_ID,
  JEKO_WEBHOOK_SECRET,
  isJekoConfigured,
  isWebhookConfigured,
};
