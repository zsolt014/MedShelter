CREATE TABLE IF NOT EXISTS residents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  room VARCHAR(50) NOT NULL,
  doctor VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Aktív',
  birth_date VARCHAR(50),
  taj VARCHAR(50),
  phone VARCHAR(50),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS medications (
  id SERIAL PRIMARY KEY,
  resident_id INT REFERENCES residents(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  qty INT,
  last_date VARCHAR(50),
  next_date VARCHAR(50)
);