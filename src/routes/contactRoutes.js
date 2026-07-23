const express = require('express');
const { createContact } = require('../controllers/contactController');
const { contactRules, handleValidation } = require('../middleware/validateContact');

const router = express.Router();

router.post('/', contactRules, handleValidation, createContact);

module.exports = router;
