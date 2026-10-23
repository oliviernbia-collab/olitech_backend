const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const contactRoutes = require('./routes/contactRoutes');
const adminContactRoutes = require('./routes/adminContactRoutes');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const teamRoutes = require('./routes/teamRoutes');
const clientRoutes = require('./routes/clientRoutes');
const financeRoutes = require('./routes/financeRoutes');
const cvTemplateRoutes = require('./routes/cvTemplateRoutes');
const cvOrderRoutes = require('./routes/cvOrderRoutes');
const cvPaymentRoutes = require('./routes/cvPaymentRoutes');

const app = express();

// Necessaire derriere un proxy/CDN (ex. la couche edge de l'hebergeur en
// production) : sans ca, express-rate-limit refuse l'en-tete X-Forwarded-For
// et ne peut pas identifier correctement l'IP reelle du visiteur.
app.set('trust proxy', 1);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

// En-tetes de securite (Referrer-Policy: no-referrer par defaut, etc.).
// CSP desactivee : cette API ne sert pas de HTML a proteger par une politique de script.
// CORP relache en cross-origin : /uploads doit rester chargeable depuis le frontend (autre port/domaine).
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Doit rester AVANT express.json() : le webhook Jeko a besoin du corps brut
// (non parse) pour verifier la signature HMAC. Une fois ce flux consomme ici,
// express.json() l'ignore sans conflit sur les autres routes.
app.use('/api/cv-payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rebond public -> frontend local, utilise comme successUrl/errorUrl Jeko
// quand PUBLIC_API_URL (tunnel) differe de FRONTEND_URL (dev local non HTTPS).
app.get('/cv-redirect', (req, res) => {
  const { ref, status } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const suffix = status === 'success' ? 'succes' : 'echec';
  res.redirect(`${frontendUrl}/cv/suivi/${encodeURIComponent(ref || '')}?paiement=${suffix}`);
});

app.use('/api/contact', contactRoutes);
app.use('/api/contacts', adminContactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/cv-templates', cvTemplateRoutes);
app.use('/api/cv-orders', cvOrderRoutes);
app.use('/api/cv-payments', cvPaymentRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l’API OliTech',
    version: '1.0.0'
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  // Les erreurs de validation (middlewares/fileFilter, limites Multer) sont des
  // erreurs client (400) ; tout le reste (panne BDD, exception imprevue) est une
  // vraie erreur serveur (500).
  const statusCode = err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  const message = statusCode === 500 ? 'Une erreur est survenue, veuillez reessayer.' : err.message;
  return res.status(statusCode).json({ success: false, message });
});

module.exports = app;
