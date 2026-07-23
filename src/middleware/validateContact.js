const { body, validationResult } = require('express-validator');

const contactRules = [
  body('nom').trim().notEmpty().withMessage('Le nom est requis').isLength({ max: 150 }),
  body('email').trim().notEmpty().withMessage("L'email est requis").isEmail().withMessage('Email invalide'),
  body('telephone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body('sujet').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Le message est requis'),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { contactRules, handleValidation };
