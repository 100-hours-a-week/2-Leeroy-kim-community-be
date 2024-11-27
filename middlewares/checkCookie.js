const path = require('path');
const fs = require('fs').promises;
const boardPath = path.join(__dirname, '../data/boardInfo.json');
const commentPath = path.join(__dirname, '../data/commentInfo.json');

//NOTE: 쿠키 유효 검사
exports.checkCookie = (req, res, next) => {
    const user_id = req.cookies.user_id;

    if (!user_id)
        return res.status(401).json({
            message: '인증정보가 유효하지 않습니다.',
            data: null,
        });

    req.user = { user_id };
    next();
};

//NOTE: 회원로직 권한 검사
exports.checkAuth = (req, res, next) => {
    if (req.params.id != req.user.user_id) {
        return res.status(403).json({
            message: '권한이 없습니다.',
            data: null,
        });
    }

    next();
};

//NOTE: 게시글 권한 검사
exports.checkBoardAuth = async (req, res, next) => {
    const board_id = req.params.board_id;
    const data = await fs.readFile(boardPath, 'utf8');
    const boardData = JSON.parse(data);

    const board = boardData.boards.find((board) => board.board_id == board_id);
    const write_id = board.user_id;

    if (write_id != req.user.user_id) {
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

    const data = await fs.readFile(commentPath, 'utf8');
    const commentData = JSON.parse(data);

    const board = commentData.boards.find(
        (board) => board.board_id == board_id
    );
    if (!board)
        return res.status(404).json({
            message: '존재하지 않는 게시물입니다!',
            data: null,
        });

    const comment = board.comment_list.find(
        (comment) => comment.comment_id == comment_id
    );
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
