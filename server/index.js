const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Lakók lekérése
app.get('/api/residents', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM residents ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Új lakó felvétele
app.post('/api/residents', async (req, res) => {
  const { name, room, doctor, status, birth_date, taj, phone, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO residents (name, room, doctor, status, birth_date, taj, phone, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, room, doctor, status, birth_date, taj, phone, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Szerver fut a ${PORT} porton`));