const express = require('express');
const { list, create, update, remove } = require('../controllers/serviceController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', list);
router.post('/', requireAuth, create);
router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);

module.exports = router;
