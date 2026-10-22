const crypto = require('crypto');
const { JEKO_WEBHOOK_SECRET } = require('../config/jeko');

function verifySignature(rawBody, signatureHeader) {
  if (!JEKO_WEBHOOK_SECRET || !signatureHeader) return false;

  const expected = crypto.createHmac('sha256', JEKO_WEBHOOK_SECRET).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const receivedBuf = Buffer.from(signatureHeader, 'utf8');

  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

module.exports = { verifySignature };
