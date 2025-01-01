const path = require('path');
const fs = require('fs').promises;
const commentPath = path.join(__dirname, '../data/commentInfo.json');
const userPath = path.join(__dirname, '../data/userInfo.json');
const boardPath = path.join(__dirname, '../data/boardInfo.json');
const pool = require('../config/db');
const dayjs = require('dayjs');

const getBoardQuery = 'SELECT * FROM boardInfo WHERE board_id = ?';
const getCommentQuery = 'SELECT * FROM comment WHERE board_id = ?';

const readCommentData = async () => {
    const data = await fs.readFile(commentPath, 'utf8');
    return JSON.parse(data);
};

const readUserData = async () => {
    const data = await fs.readFile(userPath, 'utf8');
    return JSON.parse(data);
};

const readBoardData = async () => {
    const data = await fs.readFile(boardPath, 'utf8');
    return JSON.parse(data);
};

//NOTE: 댓글 생성
exports.addComments = async (board_id, user_id, comment) => {
    try {
        const [boardRows] = await pool
            .promise()
            .query(getBoardQuery, [board_id]);
        if (boardRows.length === 0) return 404;

        const [commentRows] = await pool
            .promise()
            .query(getCommentQuery, [board_id]);

        const newComment = [
            board_id,
            user_id,
            comment,
            dayjs().format('YYYY-MM-DD HH:mm:ss'),
        ];

        const addCommentQuery =
            'INSERT INTO comment(board_id,user_id,comment,comment_date) VALUES(?)';
        const updateBoardQuery =
            'UPDATE boardInfo SET comment_count = comment_count + 1 WHERE board_id = ?';

        const [result] = await pool
            .promise()
            .query(addCommentQuery, [newComment]);
        await pool.promise().query(updateBoardQuery, [board_id]);

        return { comment_id: result.insertId };
    } catch (e) {
        throw new Error(`댓글 생성중 에러 발생 => ${e}`);
    }
};

//NOTE: 댓글 조회
exports.getComment = async (board_id) => {
    try {
        const [commentRows] = await pool
            .promise()
            .query(getCommentQuery, [board_id]);
        if (commentRows.length === 0) return 200;

        const result = await Promise.all(
            commentRows.map(async (comment) => {
                const [[userRows]] = await pool
                    .promise()
                    .query('SELECT * FROM user WHERE user_id = ?', [
                        comment.user_id,
                    ]);

                return {
                    ...comment,
                    nickname: userRows.nickname,
                    profile_img:
                        userRows.profile_img != null
                            ? `http://${process.env.BACKEND_URL}:5050${userRows.profile_img}`
                            : null,
                };
            })
        );

        return JSON.stringify(result);
    } catch (e) {
        throw new Error(`댓글 조회중 에러 발생 => ${e}`);
    }
};

//NOTE: 댓글 삭제
exports.delComment = async (board_id, comment_id) => {
    try {
        const commentData = await readCommentData();
        const boardIndex = commentData.boards.findIndex(
            (board) => board.board_id == board_id
        );
        const commentIndex = commentData.boards[
            boardIndex
        ].comment_list.findIndex((comment) => comment.comment_id == comment_id);

        commentData.boards[boardIndex].comment_list.splice(commentIndex, 1);

        const commentCount = commentData.boards[boardIndex].comment_list.length;
        const boardData = await readBoardData();
        const updateBoardIndex = boardData.boards.findIndex(
            (board) => board.board_id == board_id
        );

        boardData.boards[updateBoardIndex].comment_count = commentCount;
        //NOTE: 댓글 삭제
        await fs.writeFile(
            commentPath,
            JSON.stringify(commentData, null, 4),
            'utf8'
        );
        //NOTE: 게시판 댓글 갯수 업데이트
        await fs.writeFile(
            boardPath,
            JSON.stringify(boardData, null, 4),
            'utf8'
        );

        return { comment_id: comment_id };
    } catch (e) {
        console.log(`댓글 삭제중 에러 발생 => ${e}`);
        throw new Error('댓글 생성중 문제가 발생했습니다!');
    }
};
//NOTE: 댓글 수정
exports.editComment = async (board_id, comment_id, comment) => {
    try {
        const commentData = await readCommentData();
        const boardIndex = commentData.boards.findIndex(
            (board) => board.board_id == board_id
        );
        const commentIndex = commentData.boards[
            boardIndex
        ].comment_list.findIndex((comment) => comment.comment_id == comment_id);

        const newComment =
            commentData.boards[boardIndex].comment_list[commentIndex];
        commentData.boards[boardIndex].comment_list[commentIndex] = {
            ...newComment,
            comment,
            update_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };

        await fs.writeFile(
            commentPath,
            JSON.stringify(commentData, null, 4),
            'utf8'
        );

        return { comment_id: comment_id };
    } catch (e) {
        console.log(`댓글 수정중 에러 발생 => ${e}`);
        throw new Error('댓글 수정중 문제가 발생했습니다!');
    }
};
