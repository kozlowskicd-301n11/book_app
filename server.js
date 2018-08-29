'use strict'
require('dotenv').config();

const express = require('express');
const pg = require('pg');
require('pg').defaults.ssl = true;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const PORT = process.env.PORT;

const client = new pg.Client(process.env.DATABASE_URL);

client.connect();
client.on('error', error => {
  console.error(error);
});

app.use(express.static('./public'));

app.get('/', (request, response) => {
  response.redirect('/books');
});

app.get('/books', (request, response) => {
  client.query('SELECT title, author, image_url, id FROM books;')
    .then(results => {
      response.render('index', {books : results.rows});
    });
});

app.get('/add', (request, response) => {
  response.render('./pages/new');
});

app.post('/add', (request, response) => {
  let {title, author, isbn, description, image_url} = request.body;

  let SQL = 'INSERT INTO books(title, author, isbn, description, image_url) VALUES ($1, $2, $3, $4, $5);';
  let values = [title, author, isbn, description, image_url];

  return client.query(SQL, values)
    .then(response.render('/books'))
    .catch(err => console.log(err, response));
});

app.get('/books/:thisId', (request, response) => {
  client.query(`SELECT title, author, image_url, description, isbn FROM books WHERE id = ($1);`, [request.params.thisId])
    .then(results => {
      response.render('./pages/show', {book : results.rows});
    });
});

app.use('*', (request, response) => {
  response.render('./pages/error');
})
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});