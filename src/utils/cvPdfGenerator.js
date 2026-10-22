const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { getLayoutRenderer } = require('../cvTemplates/registry');
const { getPalette } = require('../cvTemplates/palettes');

// Stocke HORS du dossier /uploads (servi publiquement) : le PDF n'est accessible
// que via le controleur de telechargement, qui verifie la reference de commande.
const outputRoot = path.join(__dirname, '../../private/cv-orders');
fs.mkdirSync(outputRoot, { recursive: true });

function resolvePhotoUrl(photoPath) {
  if (!photoPath) return null;

  // Photo Cloudinary (URL publique) : Puppeteer la charge directement sur le reseau.
  if (/^https?:\/\//i.test(photoPath)) return photoPath;

  // Ancien fichier local (upload fait avant la configuration de Cloudinary) :
  // on l'inline en base64 pour que Puppeteer n'ait pas besoin du serveur HTTP.
  const absolute = path.join(__dirname, '../..', photoPath.replace(/^\//, ''));
  if (!fs.existsSync(absolute)) return null;
  const ext = path.extname(absolute).replace('.', '') || 'jpeg';
  const base64 = fs.readFileSync(absolute).toString('base64');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${base64}`;
}

async function generatePdf(order, template) {
  const renderer = getLayoutRenderer(template.layout_key);
  const palette = getPalette(template.palette_key);
  const formData = typeof order.form_data === 'string' ? JSON.parse(order.form_data) : order.form_data;
  const photoUrl = resolvePhotoUrl(order.photo_path);

  const html = renderer(formData, photoUrl, palette);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const orderDir = path.join(outputRoot, order.order_reference);
    fs.mkdirSync(orderDir, { recursive: true });
    const pdfPath = path.join(orderDir, 'cv.pdf');

    await page.pdf({ path: pdfPath, width: '794px', height: '1123px', printBackground: true });

    // Chemin relatif stocke en base ; resolu par cvOrderController.download
    // via outputRoot, jamais expose comme URL publique directe.
    return path.join(order.order_reference, 'cv.pdf');
  } finally {
    await browser.close();
  }
}

module.exports = { generatePdf, outputRoot };
