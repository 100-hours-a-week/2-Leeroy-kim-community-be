const express = require('express');
const router = require('./Routes/router');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const timeout = require('connect-timeout');
const RateLimit = require('express-rate-limit');
const helmet = require('helmet');
const pool = require('./config/db');
require('dotenv').config();

const app = express();
const port = 5050;
app.use(express.json());
const cookieSecret = process.env.COOKIE_SECRET_KEY;
app.use(cookieParser(cookieSecret));
app.use(
    cors({
        origin: [process.env.CLIENT_URL],
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true,
    })
);

app.use(timeout('5s'));
//api 요청 제한 미들웨어
exports.apiLimiter = RateLimit({
    windowMs: 60 * 1000, //1분
    max: 50,
    handler(req, res) {
        res.status(this.statusCode).json({
            code: this.statusCode, //RateLimit의 반환객체는 429code를 default로 반환하게 되어있음
            message: '1분에 50번만 요청 할 수 있습니다.',
        });
    },
});

// CSP 설정
const cspOptions = {
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
    },
};

app.use(helmet());
app.use(helmet.contentSecurityPolicy(cspOptions));
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

app.use('/api', this.apiLimiter, router);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/resource', express.static(path.join(__dirname, 'resource')));

pool.connect((e) => {
    if (e) {
        console.error('❌ Database connection failed:', e.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to the MySQL database!');
    }
});

app.listen(port, () => {
    console.log(`Sever is running on http://localhost:${port}`);
});
