const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Open SQLite database
const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

app.get('/', (req, res) => {
  res.send(`
    <form action="/login" method="post">
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Check if email exists in the database
  db.get(`SELECT password FROM users WHERE email = ?`, [email], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (!row) {
      return res.send('Email or password is incorrect');
    }

    // Compare entered password with the hashed password from the database
    bcrypt.compare(password, row.password, (err, isMatch) => {
      if (err) {
        return console.error(err.message);
      }
      if (isMatch) {
        return res.send('Login successful');
      }
      res.send('Email or password is incorrect');
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});