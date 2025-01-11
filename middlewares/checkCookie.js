const path = require('path');
const pool = require('../config/db');
const fs = require('fs').promises;
const boardPath = path.join(__dirname, '../data/boardInfo.json');
const commentPath = path.join(__dirname, '../data/commentInfo.json');

//NOTE: 쿠키 유효 검사
exports.checkCookie = (req, res, next) => {
    const user_id = req.signedCookies.user_id;

    if (!user_id)
        return res.status(401).json({
            message: '인증정보가 유효하지 않습니다.',
            data: null,
        });

    req.user = { user_id };
    next();
};

//NOTE: 게시글 권한 검사
exports.checkBoardAuth = async (req, res, next) => {
    const board_id = req.params.board_id;
    const [[write_id]] = await pool
        .promise()
        .query('SELECT user_id FROM boardInfo WHERE board_id = ?', [board_id]);

    if (write_id.user_id != req.user.user_id) {
        return res.status(403).json({
            message: '권한이 없습니다.',
            data: null,
        });
    }

    next();
};

//NOTE: 댓글 권한 검사
exports.checkCommentAuth = async (req, res, next) => {
    const user_id = req.user.user_id;
    const board_id = req.params.board_id;
    const comment_id = req.params.comment_id;

    const [[board]] = await pool
        .promise()
        .query('SELECT user_id FROM boardInfo WHERE board_id = ?', [board_id]);

    if (!board)
        return res.status(404).json({
            message: '존재하지 않는 게시물입니다!',
            data: null,
        });

    const [[comment]] = await pool
        .promise()
        .query('SELECT * FROM comment WHERE comment_id = ?', [comment_id]);

    if (!comment)
        return res.status(404).json({
            message: '존재하지 않는 댓글입니다!',
            data: null,
        });

    if (user_id != comment.user_id) {
        return res.status(403).json({
            message: '권한이 없습니다,',
            data: null,
        });
    }

    req.info = { user_id, board_id, comment_id };
    next();
};
