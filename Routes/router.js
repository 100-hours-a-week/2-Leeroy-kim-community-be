const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const boardRoutes = require('./boardRoutes');

router.use('/users', userRoutes);
router.use('/boards', boardRoutes);

module.exports = router;
