const express = require('express');
const router = require('./Routes/router');
const path = require('path');

const app = express();
const port = 5050;

app.use(express.json());
app.use('/api', router);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/resource', express.static(path.join(__dirname, 'resource')));

app.listen(port, () => {
    console.log(`Sever is running on http://localhost:${port}`);
});
