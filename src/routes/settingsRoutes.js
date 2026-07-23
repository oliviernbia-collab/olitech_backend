const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', getSettings);
router.put('/', requireAuth, updateSettings);

module.exports = router;
