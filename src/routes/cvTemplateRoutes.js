const express = require('express');
const { listPublic, listAdmin, getBySlug, update } = require('../controllers/cvTemplateController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', listPublic);
router.get('/admin', requireAuth, listAdmin);
router.get('/:slug', getBySlug);
router.put('/:id', requireAuth, update);

module.exports = router;
