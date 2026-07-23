const pool = require('../config/db');

const VALID_STATUSES = ['en_cours', 'termine', 'en_pause'];

async function list(req, res) {
  const [rows] = await pool.query('SELECT * FROM clients_projects ORDER BY created_at DESC');
  return res.json({ success: true, clients: rows });
}

async function create(req, res) {
  const { client_name, project_name, status, description } = req.body;

  if (!client_name) {
    return res.status(400).json({ success: false, message: 'Le nom du client est requis.' });
  }
  const finalStatus = VALID_STATUSES.includes(status) ? status : 'en_cours';

  const [result] = await pool.query(
    'INSERT INTO clients_projects (client_name, project_name, status, description) VALUES (?, ?, ?, ?)',
    [client_name, project_name || null, finalStatus, description || null]
  );

  return res.status(201).json({ success: true, id: result.insertId });
}

async function update(req, res) {
  const { id } = req.params;
  const { client_name, project_name, status, description } = req.body;

  if (!client_name) {
    return res.status(400).json({ success: false, message: 'Le nom du client est requis.' });
  }
  const finalStatus = VALID_STATUSES.includes(status) ? status : 'en_cours';

  await pool.query(
    'UPDATE clients_projects SET client_name = ?, project_name = ?, status = ?, description = ? WHERE id = ?',
    [client_name, project_name || null, finalStatus, description || null, id]
  );

  return res.json({ success: true });
}

async function remove(req, res) {
  const { id } = req.params;
  await pool.query('DELETE FROM clients_projects WHERE id = ?', [id]);
  return res.json({ success: true });
}

module.exports = { list, create, update, remove };
