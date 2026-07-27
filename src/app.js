const express = require('express');
const cors = require('cors');
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

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
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

// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'Route introuvable' });
// });

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l’API OliTech',
    version: '1.0.0'
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  return res.status(400).json({ success: false, message: err.message || 'Requete invalide.' });
});

module.exports = app;
