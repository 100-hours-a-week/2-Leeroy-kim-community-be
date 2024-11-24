const express = require('express');
const router = require('./Routes/router');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = 5050;

app.use(express.json());
const cookieSecret = process.env.COOKIE_SECRET_KEY;
app.use(cookieParser(cookieSecret));

app.use('/api', router);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/resource', express.static(path.join(__dirname, 'resource')));

app.listen(port, () => {
    console.log(`Sever is running on http://localhost:${port}`);
});
