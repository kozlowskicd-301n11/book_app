'use strict'
require('dotenv').config();

const express = require('express');
const pg = require('pg');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const PORT = process.env.PORT;

// const conString = 'postgres://qprfdlcbagobrk:8e859511a13c3a26fa2ce9f58d793f7d86f711e0ed6f39704546bcdb678eaf86@ec2-50-17-194-129.compute-1.amazonaws.com:5432/dej042teb9sea6';
const client = new pg.Client({//process.env.DATABASE_URL)
    user: "qprfdlcbagobrk",
    password: "8e859511a13c3a26fa2ce9f58d793f7d86f711e0ed6f39704546bcdb678eaf86",
    database: "dej042teb9sea6",
    port: 5432,
    host: "ec2-50-17-194-129.compute-1.amazonaws.com",
    ssl: true
}); 
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