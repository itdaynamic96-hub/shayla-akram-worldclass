-- Cloudflare D1 schema for the independent World-Class Hybrid backend.
-- Private tables are never exposed by public API routes.
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip_hash TEXT NOT NULL,
  attempted_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip_hash, attempted_at);

CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY,
  module_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0,1)),
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_site_content_public ON site_content(published, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_content_module ON site_content(module_id, published);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  youtube_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prayer_times (
  date_key TEXT PRIMARY KEY,
  fajr TEXT NOT NULL,
  sunrise TEXT NOT NULL DEFAULT '',
  dhuhr TEXT NOT NULL,
  asr TEXT NOT NULL,
  maghrib TEXT NOT NULL,
  isha TEXT NOT NULL,
  jumuah TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  submitted_at TEXT NOT NULL,
  reviewed_at TEXT,
  review_note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_applications_status_date ON applications(status, submitted_at DESC);

CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  skills TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  submitted_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_volunteers_status_date ON volunteers(status, submitted_at DESC);

CREATE TABLE IF NOT EXISTS account_entries (
  id TEXT PRIMARY KEY,
  fund TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income','expense')),
  amount_paisa INTEGER NOT NULL CHECK (amount_paisa > 0),
  occurred_on TEXT NOT NULL,
  description TEXT NOT NULL,
  reference TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_account_entries_fund_date ON account_entries(fund, occurred_on DESC);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL REFERENCES admin_users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
