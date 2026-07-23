const pool = require('../config/db');
const { sendContactNotification } = require('../utils/mailer');

async function createContact(req, res) {
  const { nom, email, telephone, sujet, message } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO contacts (nom, email, telephone, sujet, message) VALUES (?, ?, ?, ?, ?)',
      [nom, email, telephone || null, sujet || null, message]
    );

    sendContactNotification({ nom, email, telephone, sujet, message }).catch((err) => {
      console.error("Echec de l'envoi de l'email de notification:", err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Votre message a bien ete envoye. Nous vous repondrons rapidement.',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement du contact:', err.message);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue, veuillez reessayer plus tard.",
    });
  }
}

async function listContacts(req, res) {
  const [rows] = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
  return res.json({ success: true, contacts: rows });
}

async function markContactRead(req, res) {
  const { id } = req.params;
  const { is_read } = req.body;
  await pool.query('UPDATE contacts SET is_read = ? WHERE id = ?', [is_read ? 1 : 0, id]);
  return res.json({ success: true });
}

async function deleteContact(req, res) {
  const { id } = req.params;
  await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
  return res.json({ success: true });
}

module.exports = { createContact, listContacts, markContactRead, deleteContact };
