const express = require('express');
const { createContact } = require('../controllers/contactController');
const { contactRules, handleValidation } = require('../middleware/validateContact');
const { publicWriteLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/', publicWriteLimiter, contactRules, handleValidation, createContact);

module.exports = router;
