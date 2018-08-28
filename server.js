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

app.get('/hello', (request, response) => {
    response.render('index');
});
app.get('/ejs', (request, response) => {
    response.render('index');
})
app.get('/books', (request, response) => {
    client.query('SELECT title, author, image_url FROM books;')
        .then(results => {
            response.render('index', {books : results.rows});
        });
});
app.get('*', (request, response) => {
    response.render('./pages/error');
})
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});