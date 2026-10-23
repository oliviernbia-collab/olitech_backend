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

// URL websocket d'un Chromium distant (ex. Browserless.io) — necessaire en
// production sur de l'hebergement mutualise, ou lancer un Chromium local est
// souvent impossible (bibliotheques systeme manquantes, pas d'acces root).
// Vide en local : on lance alors un Chromium local comme avant.
const REMOTE_WS_ENDPOINT = process.env.PUPPETEER_WS_ENDPOINT || '';

async function generatePdf(order, template) {
  const renderer = getLayoutRenderer(template.layout_key);
  const palette = getPalette(template.palette_key);
  const formData = typeof order.form_data === 'string' ? JSON.parse(order.form_data) : order.form_data;
  const photoUrl = resolvePhotoUrl(order.photo_path);

  const html = renderer(formData, photoUrl, palette);

  const browser = REMOTE_WS_ENDPOINT
    ? await puppeteer.connect({ browserWSEndpoint: REMOTE_WS_ENDPOINT })
    : await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  try {
    const page = await browser.newPage();
    // 'networkidle0' n'aboutit pas de facon fiable sur un navigateur distant
    // (trafic CDP/keep-alive en arriere-plan) : on attend juste le DOM, puis
    // explicitement les images (photo du CV) avec une limite de temps courte.
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page
      .evaluate(() =>
        Promise.all(
          Array.from(document.images)
            .filter((img) => !img.complete)
            .map(
              (img) =>
                new Promise((resolve) => {
                  img.onload = resolve;
                  img.onerror = resolve;
                })
            )
        )
      )
      .catch(() => {});

    const orderDir = path.join(outputRoot, order.order_reference);
    fs.mkdirSync(orderDir, { recursive: true });
    const pdfPath = path.join(orderDir, 'cv.pdf');

    await page.pdf({ path: pdfPath, width: '794px', height: '1123px', printBackground: true });

    // Chemin relatif stocke en base ; resolu par cvOrderController.download
    // via outputRoot, jamais expose comme URL publique directe.
    return path.join(order.order_reference, 'cv.pdf');
  } finally {
    // Un navigateur distant partage reste ouvert pour d'autres requetes :
    // on se deconnecte seulement, on ne le ferme pas (close() le tuerait
    // pour tout le monde). Un navigateur local, lui, doit etre ferme.
    if (REMOTE_WS_ENDPOINT) {
      browser.disconnect();
    } else {
      await browser.close();
    }
  }
}

module.exports = { generatePdf, outputRoot };
