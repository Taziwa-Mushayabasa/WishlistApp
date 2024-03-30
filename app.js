const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); 
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

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL)');
  db.run('CREATE TABLE IF NOT EXISTS wishlist (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT NOT NULL)');
});


app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Handle login attempts with both username and password
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  //stops SQL injection
  const query = `SELECT * FROM users WHERE username = ?`;
  
  db.get(query, [username], (err, row) => {
    if (err) {
      res.status(500).send('An error occurred');
      console.error(err.message);
    } else if (row && bcrypt.compareSync(password, row.password)) { //this is where bcrypt is used, this is for password hashing
      res.redirect('/'); 
    } else {
      res.send('Login failed');
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});