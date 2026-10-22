const express = require('express');
const {
  create,
  getByReference,
  listAdmin,
  getAdmin,
  markPaidManually,
  download,
} = require('../controllers/cvOrderController');
const requireAuth = require('../middleware/requireAuth');
const { uploadCvPhoto } = require('../middleware/uploadCvPhoto');
const { cvOrderRules, handleValidation } = require('../middleware/validateCvOrder');
const { publicWriteLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.get('/admin', requireAuth, listAdmin);
router.get('/admin/:id', requireAuth, getAdmin);
router.post('/admin/:id/mark-paid', requireAuth, markPaidManually);

router.get('/download/:reference', download);

router.post(
  '/',
  publicWriteLimiter,
  uploadCvPhoto.single('photo'),
  cvOrderRules,
  handleValidation,
  create
);

router.get('/:reference', getByReference);

module.exports = router;
