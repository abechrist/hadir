-- HADIR Database Schema for Neon PostgreSQL
-- Run this in Neon SQL Editor

CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'pendamping',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS schedules (
  schedule_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  location JSONB,
  mentor_id TEXT,
  status TEXT DEFAULT 'active',
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS attendances (
  attendance_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT,
  type TEXT NOT NULL,
  selfie_url TEXT,
  log TEXT,
  timestamp TEXT,
  date TEXT,
  status TEXT DEFAULT 'pending',
  location JSONB,
  location_type TEXT,
  assignment_id TEXT,
  schedule_id TEXT,
  schedule_title TEXT,
  verification_note TEXT,
  verified_by TEXT,
  verified_at TEXT
);

CREATE TABLE IF NOT EXISTS daily_logs (
  log_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT,
  date TEXT,
  entries JSONB DEFAULT '[]'::jsonb,
  check_in_time TEXT,
  check_out_time TEXT,
  status TEXT DEFAULT 'pending',
  verification_note TEXT,
  verified_by TEXT
);

CREATE TABLE IF NOT EXISTS leaves (
  leave_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_role TEXT,
  date TEXT,
  type TEXT,
  reason TEXT,
  attachment_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT,
  verification_note TEXT,
  verified_by TEXT
);

CREATE TABLE IF NOT EXISTS assignments (
  assignment_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date_start TEXT,
  date_end TEXT,
  location JSONB,
  description TEXT,
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS config (
  id TEXT PRIMARY KEY DEFAULT 'officeLocation',
  lat DOUBLE PRECISION NOT NULL DEFAULT -7.3305,
  lng DOUBLE PRECISION NOT NULL DEFAULT 110.5084,
  radius DOUBLE PRECISION NOT NULL DEFAULT 150,
  name TEXT NOT NULL DEFAULT 'Dinas Pemuda dan Olahraga Kota Salatiga'
);

INSERT INTO config (id, lat, lng, radius, name)
VALUES ('officeLocation', -7.3305, 110.5084, 150, 'Dinas Pemuda dan Olahraga Kota Salatiga')
ON CONFLICT (id) DO NOTHING;
