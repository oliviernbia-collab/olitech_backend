const express = require('express');
const { initiate, handleWebhook } = require('../controllers/cvPaymentController');
const { publicWriteLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Pas de requireAuth : initiate est appele par l'acheteur (public),
// webhook est appele par Jeko (verifie par signature, pas par JWT).
router.post('/:id/initiate', publicWriteLimiter, initiate);
router.post('/webhook', handleWebhook);

module.exports = router;
