const express = require('express');
const { login, me } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const { loginLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/login', loginLimiter, login);
router.get('/me', requireAuth, me);

module.exports = router;
