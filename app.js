const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); 
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create tables
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL)');
  db.run('CREATE TABLE IF NOT EXISTS wishlist (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT NOT NULL)');
});

// Serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});


app.post('/login', (req, res) => { //login page
  const { username, password } = req.body;
  
  const query = `SELECT * FROM users WHERE username = ?`;

  db.get(query, [username], (err, row) => { 
    if (err) {
      res.status(500).send('An error occurred');
      console.error(err.message);
    } else if (row && bcrypt.compareSync(password, row.password)) { //secure method for password
      res.redirect('/'); 
    } else {
      res.send('Login failed'); 
    }
  });
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});


app.post('/register', (req, res) => { //register page
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10); // Hash password

  const insert = `INSERT INTO users (username, password) VALUES (?, ?)`;

  db.run(insert, [username, hashedPassword], function(err) {
    if (err) {
      res.status(500).send("Error registering new user");
      console.error(err.message);
    } else {
      res.redirect('/login'); 
    }
  });
});

app.post('/wishlist', (req, res) => {
  const { item } = req.body;
  db.run(`INSERT INTO wishlist (item) VALUES (?)`, [item], function(err) {
    if (err) {
      res.status(500).send('Error adding item to wishlist');
      console.error(err.message);
    } else {
      res.status(200).send({ id: this.lastID });
    }
  });
});

// Endpoint to handle updating an existing wishlist item
app.put('/wishlist/update/:id', (req, res) => {
  const { id } = req.params;
  const { item } = req.body;
  db.run(`UPDATE wishlist SET item = ? WHERE id = ?`, [item, id], function(err) {
    if (err) {
      res.status(500).send('Error updating wishlist item');
      console.error(err.message);
    } else {
      res.status(200).send({ updatedID: id });
    }
  });
});

// Correcting the delete endpoint
app.delete('/wishlist/delete/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM wishlist WHERE id = ?`, id, function(err) {
    if (err) {
      res.status(500).send('Error deleting wishlist item');
      console.error(err.message);
    } else {
      res.status(200).send({ deletedID: id });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
