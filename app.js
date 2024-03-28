const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

db.run('CREATE TABLE IF NOT EXISTS wishlist (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT NOT NULL)');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {

  res.redirect('/index.html');
});

// Serve the wishlist page (index.html)
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.post('/wishlist', (req, res) => {
  const { item } = req.body;
  const sql = 'INSERT INTO wishlist (item) VALUES (?)';
  db.run(sql, [item], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error adding to wishlist');
    } else {

      res.send('<script>alert("Wishlist item added"); window.location.href = "/index.html";</script>');
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});