const express = require('express');
const { list, create, update, remove } = require('../controllers/portfolioController');
const requireAuth = require('../middleware/requireAuth');
const { uploadPortfolioImage } = require('../middleware/upload');

const router = express.Router();

router.get('/', list);
router.post('/', requireAuth, uploadPortfolioImage.single('image'), create);
router.put('/:id', requireAuth, uploadPortfolioImage.single('image'), update);
router.delete('/:id', requireAuth, remove);

module.exports = router;
