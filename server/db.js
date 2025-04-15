const Database = require('better-sqlite3');
const db = new Database('app.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    server TEXT,
    train TEXT,
    station TEXT,
    name TEXT,
    message TEXT
  )
`).run();

module.exports = db;