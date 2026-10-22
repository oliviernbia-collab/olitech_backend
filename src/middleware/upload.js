const multer = require('multer');
const path = require('path');

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

// Filtre rapide sur le Content-Type declare par le client (cote UX : message
// d'erreur immediat). C'est une premiere passe seulement — le controleur
// verifie ensuite les "magic bytes" reels via validateFileSignature() avant
// tout envoi vers Cloudinary ou le disque, car ce Content-Type est falsifiable.
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    const err = new Error('Format de fichier non supporte (images jpg/png/webp/gif ou videos mp4/webm/mov).');
    err.statusCode = 400;
    return cb(err);
  }
  cb(null, true);
};

// Memoire (pas disque) : le buffer est verifie (magic bytes) puis envoye a
// Cloudinary directement depuis le controleur, sans jamais toucher le disque
// quand Cloudinary est configure.
const uploadPortfolioImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter,
});

// Repli local tant que Cloudinary n'est pas configure.
const uploadDir = path.join(__dirname, '../../uploads/portfolio');

module.exports = { uploadPortfolioImage, uploadDir, ALLOWED_TYPES };
