const express = require('express');
const app = express();

const portnumber = 8000;

app.get('/', (req, res) => {
    res.send("<h1>hello!</h1>");
});

app.listen(portnumber, () => {
    console.log(`App is listening on localhost:${portnumber}`);
});