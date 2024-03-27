const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the in-memory SQLite database.');
});


db.run('CREATE TABLE wishlist (id INTEGER PRIMARY KEY, item TEXT)');


app.post('/wishlist', (req, res) => {
  const { item } = req.body;
  const sql = `INSERT INTO wishlist (item) VALUES (?)`;
  db.run(sql, [item], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.send(`A new wishlist item has been added with ID ${this.lastID}`);
  });
});


app.get('/wishlist', (req, res) => {
  const sql = `SELECT * FROM wishlist`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.json(rows);
  });
});


app.get('/', (req, res) => {
  res.send(`
    <h2>Wishlist App</h2>
    <form action="/wishlist" method="post">
      <input type="text" name="item" placeholder="Add to wishlist" required>
      <button type="submit">Submit</button>
    </form>
    <script>
      document.querySelector('form').onsubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(e.target)).toString()
        });
        if(response.ok) {
          window.location.reload();
        }
      };
    </script>
  `);
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
