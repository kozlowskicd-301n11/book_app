require('dotenv').config();

const express = require('express');
// const pg = require('pg');
const app = express();

const PORT = 3000;

app.use(express.static('./public'));

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})