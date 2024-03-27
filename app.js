const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); 


const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

db.serialize(() => {

  db.run('CREATE TABLE IF NOT EXISTS wishlist (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT NOT NULL)');
});

app.post('/wishlist', (req, res) => {
  const { item } = req.body;
  const sql = 'INSERT INTO wishlist (item) VALUES (?)';
  db.run(sql, [item], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).send({ error: 'Error adding wishlist item' });
    } else {
      res.json({ success: 'Wishlist item added', id: this.lastID });
    }
  });
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
