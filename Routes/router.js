const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const boardRoutes = require('./boardRoutes');
const commentRoutes = require('./commentRoutes');

router.use('/users', userRoutes);
router.use('/boards', boardRoutes);
router.use('/boards/:board_id/comments', commentRoutes);

module.exports = router;
