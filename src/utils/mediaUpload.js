const fs = require('fs');
const path = require('path');
const streamifier = require('streamifier');
const FileType = require('file-type'); // v16.x : API CommonJS (fromBuffer), versions 17+ sont ESM-only
const { cloudinary } = require('../config/cloudinary');

// Verifie les "magic bytes" reels du fichier (pas le Content-Type declare par
// le client, trivialement falsifiable). Si le format reel n'est pas detecte
// (ex: SVG/texte/script deguise en image) ou ne correspond a aucun type
// autorise, le fichier est rejete.
async function validateFileSignature(buffer, allowedMimeTypes) {
  const detected = await FileType.fromBuffer(buffer);

  if (!detected || !allowedMimeTypes.includes(detected.mime)) {
    const err = new Error(
      "Le contenu du fichier ne correspond pas a un format autorise (verification du contenu reel, pas de l'extension)."
    );
    err.statusCode = 400;
    throw err;
  }

  return detected; // { ext, mime }
}

function uploadBufferToCloudinary(buffer, { folder, resourceType = 'auto' }) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

function saveBufferLocally(buffer, dir, ext) {
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  fs.writeFileSync(path.join(dir, filename), buffer);
  return filename;
}

module.exports = { validateFileSignature, uploadBufferToCloudinary, saveBufferLocally };
