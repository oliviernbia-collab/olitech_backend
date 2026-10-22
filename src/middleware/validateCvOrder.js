const { body, validationResult } = require('express-validator');

const cvOrderRules = [
  body('template_id').notEmpty().withMessage('Modele requis').isInt(),
  body('buyer_name').trim().notEmpty().withMessage('Le nom est requis').isLength({ max: 150 }),
  body('buyer_email').trim().notEmpty().withMessage("L'email est requis").isEmail().withMessage('Email invalide'),
  body('buyer_phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body('form_data').notEmpty().withMessage('Contenu du CV requis'),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { cvOrderRules, handleValidation };
