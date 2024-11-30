const express = require('express');
const router = require('./Routes/router');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5050;
console.log('CLIENT_URL:', process.env.CLIENT_URL);
app.use(express.json());
const cookieSecret = process.env.COOKIE_SECRET_KEY;
app.use(cookieParser(cookieSecret));
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

app.use('/api', router);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/resource', express.static(path.join(__dirname, 'resource')));

app.listen(port, () => {
    console.log(`Sever is running on http://localhost:${port}`);
});
