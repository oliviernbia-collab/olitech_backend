const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/portfolio');
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const uploadPortfolioImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error("Format d'image non supporte (jpg, png, webp, gif uniquement)."));
    }
    cb(null, true);
  },
});

module.exports = { uploadPortfolioImage, uploadDir };
