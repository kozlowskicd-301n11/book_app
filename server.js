'use strict'
require('dotenv').config();

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
// require('pg').defaults.ssl = true;
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
  response.render('./pages/books/new');
});
app.get('/searches/new', (request, response) => {
  response.render('pages/searches/new');
});
app.get('/books/:thisId', (request, response) => {
  client.query(`SELECT title, author, isbn, description, image_url  FROM books WHERE id = ($1);`, [request.params.thisId])
    .then(results => {
      console.log(results.rows);
      response.render('./pages/books/show', {book : results.rows, newBook : ''})
    });
});
app.post('/add', makeBook);
app.post('/searches', makeSearch);

app.use('*', (request, response) => {
  response.render('./pages/error');
})
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});


function makeSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes';
  let query = '';

  let modifiedRequest = request.body.search[0].split(' ').join('+');

  if (request.body.search[1] === 'title') query += `+intitle:${modifiedRequest}`;
  if (request.body.search[1] === 'author') query += `+inauthor:${modifiedRequest}`;

  superagent.get(url)
    .query({'q': query})
    .then(apiResponse => apiResponse.body.items.map(bookResult => {
      let { title, subtitle, authors, industryIdentifiers, imageLinks, description } = bookResult.volumeInfo;

      let coverPlaceholder = 'https://via.placeholder.com/300x150?text=No+Image+Available';

      return {
        title: title ? title : 'Title not found',
        subtitle: subtitle ? subtitle : '',
        author: authors ? authors[0] : 'Author not found',
        isbn: industryIdentifiers ? `${industryIdentifiers[0].identifier}` : 'No ISBN found',
        image_url: imageLinks ? imageLinks.smallThumbnail : coverPlaceholder,
        description: description ? description : 'No description available',
        id: industryIdentifiers ? `${industryIdentifiers[0].identifier}` : '',
      };
    }))
    .then(bookInfo => response.render('pages/searches/show', {book: bookInfo}))
    .catch(err => console.log(err, response));
}
function makeBook(request, response) {
  let {title, author, isbn, description, image_url} = request.body;

  let SQL = `INSERT INTO books(title, author, isbn, description, image_url) VALUES ($1, $2, $3, $4, $5);`;
  let values = [title, author, isbn, description, image_url];

  client.query(SQL, values)
    .then(client.query(`SELECT title, author, isbn, description, image_url FROM books WHERE id = (SELECT MAX(id) FROM books);`)
      .then(results => {
        response.render('./pages/books/show', {book : results.rows, newBook : 'New book added!!'})})
      .catch(err => console.log(err, response)));
}