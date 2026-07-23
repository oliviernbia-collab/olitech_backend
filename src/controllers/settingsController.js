const pool = require('../config/db');

const FIELDS = [
  'intro_paragraph_1',
  'intro_paragraph_2',
  'mission_text',
  'vision_text',
  'valeurs_text',
  'ceo_name',
  'ceo_title',
  'ceo_bio',
  'phone',
  'email',
  'website',
];

async function getSettings(req, res) {
  const [rows] = await pool.query('SELECT * FROM company_settings WHERE id = 1 LIMIT 1');
  return res.json({ success: true, settings: rows[0] || null });
}

async function updateSettings(req, res) {
  const values = FIELDS.map((field) => req.body[field] ?? null);

  const assignments = FIELDS.map((field) => `${field} = ?`).join(', ');
  await pool.query(
    `INSERT INTO company_settings (id, ${FIELDS.join(', ')}) VALUES (1, ${FIELDS.map(() => '?').join(', ')})
     ON DUPLICATE KEY UPDATE ${assignments}`,
    [...values, ...values]
  );

  return res.json({ success: true });
}

module.exports = { getSettings, updateSettings };
