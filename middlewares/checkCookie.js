const path = require('path');
const fs = require('fs').promises;
const boardPath = path.join(__dirname, '../data/boardInfo.json');

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
