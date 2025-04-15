const express = require('express')
const db = require('./db');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const path = require('path');

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
});

const app = express()
const port = 3000

app.use(limiter);
app.use(express.static("public"));
app.use(cors());

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get('/api/setMessage/:date/:server/:train/:station/:name/:message', (req, res) => {
    const { date, server, train, station, name, message } = req.params;

    if (message.length > 255) {
        return res.status(400).json({ error: "Message too long" });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
  
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
  
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
    if (![today, yesterdayStr, tomorrowStr].includes(date)) {
        return res.status(400).json({ error: 'Invalid date' });
    }

    // Make invalid incase of wrong station, server, train or if the station alredy had a message

    const insert = db.prepare(`
      INSERT INTO messages (date, server, train, station, name, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(date, server, train, station, name, message);
  
    res.json({
      status: "saved",
      id: result.lastInsertRowid
    });
})

app.get('/api/getMessages/:date/:server/:train/', (req, res) => {
    const { date, server, train } = req.params;

    const rows = db.prepare(`
        SELECT station, message, name FROM messages
        WHERE date = ? AND server = ? AND train = ?
        ORDER BY id DESC LIMIT 100
    `).all(date, server, train);

    res.json(rows || { message: null });
});

app.get('/api/getMessage/:date/:server/:train/:station', (req, res) => {
    const { date, server, train, station } = req.params;

    const row = db.prepare(`
        SELECT message FROM messages
        WHERE date = ? AND server = ? AND train = ? AND station = ?
        ORDER BY id DESC LIMIT 1
    `).get(date, server, train, station);

    res.json(row || { message: null });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});