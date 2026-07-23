const express = require('express');
const { listContacts, markContactRead, deleteContact } = require('../controllers/contactController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', requireAuth, listContacts);
router.patch('/:id/read', requireAuth, markContactRead);
router.delete('/:id', requireAuth, deleteContact);

module.exports = router;
