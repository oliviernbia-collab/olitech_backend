const multer = require('multer');
const path = require('path');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Filtre rapide sur le Content-Type declare (UX). La verification reelle du
// contenu (magic bytes) se fait dans le controleur via validateFileSignature().
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    const err = new Error('Format de photo non supporte (jpg, png, webp uniquement).');
    err.statusCode = 400;
    return cb(err);
  }
  cb(null, true);
};

const uploadCvPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter,
});

// Repli local tant que Cloudinary n'est pas configure.
const uploadDir = path.join(__dirname, '../../uploads/cv-photos');

module.exports = { uploadCvPhoto, uploadDir, ALLOWED_TYPES };
