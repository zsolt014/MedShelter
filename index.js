require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// CORS beállítások (GitHub Pages engedélyezése)
const allowedOrigins = [
  'https://zsolt014.github.io',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.github.io')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Adatbázis kapcsolat (CSAK EGYSZER DEKLARÁLVA)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ============ ÚTVONALAK (ENDPOINTS) ============

// Teszt útvonal
app.get('/', (req, res) => {
  res.send('A MedShelter API szervere sikeresen fut!');
});

// Lakók lekérése az adatbázisból
app.get('/api/residents', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM residents ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Új lakó mentése
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

// Lakó szerkesztése (PUT)
app.put('/api/residents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, room, doctor, status, birth_date, taj, phone, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE residents 
       SET name=$1, room=$2, doctor=$3, status=$4, birth_date=$5, taj=$6, phone=$7, notes=$8 
       WHERE id=$9 RETURNING *`,
      [name, room, doctor, status, birth_date, taj, phone, notes, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lakó törlése (DELETE)
app.delete('/api/residents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM residents WHERE id = $1', [id]);
    res.json({ message: 'Lakó sikeresen törölve' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ GYÓGYSZEREK ENDPOINTOK ============

// Adott lakó gyógyszerei
app.get('/api/residents/:id/medications', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medications WHERE resident_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Új gyógyszer hozzáadása
app.post('/api/medications', async (req, res) => {
  const { resident_id, name, dosage, qty, last_date, next_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO medications (resident_id, name, dosage, qty, last_date, next_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [resident_id, name, dosage, qty, last_date, next_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ BEJELENTKEZÉS (AUTH) ============

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó.' });
    }

    const user = result.rows[0];
    
    if (user.password !== password) {
      return res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó.' });
    }

    res.json({
      id: user.id,
      fullName: user.full_name || user.fullname || user.username,
      username: user.username,
      role: user.role
    });
  } catch (err) {
    console.error('Adatbázis hiba:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Szerver indítása
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Szerver fut a ${PORT} porton`));
