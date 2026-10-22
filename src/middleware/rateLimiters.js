const rateLimit = require('express-rate-limit');

// Connexion admin : fenetre stricte pour empecher le bruteforce du mot de passe.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de tentatives, reessayez dans quelques minutes.' },
});

// Formulaires/actions publiques ecrites par un visiteur non authentifie
// (contact, commande de CV, initiation de paiement).
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requetes, reessayez dans quelques minutes.' },
});

module.exports = { loginLimiter, publicWriteLimiter };
