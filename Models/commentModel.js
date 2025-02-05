const pool = require('../config/db');
const dayjs = require('../config/day');

const getBoardQuery = 'SELECT * FROM boardInfo WHERE board_id = ?';
const getCommentsQuery = 'SELECT * FROM comment WHERE board_id = ?';
const getCommentQuery = 'SELECT * FROM comment WHERE comment_id = ?';

//NOTE: 댓글 생성
exports.addComments = async (board_id, user_id, comment) => {
    try {
        const [boardRows] = await pool
            .promise()
            .query(getBoardQuery, [board_id]);
        if (boardRows.length === 0) return 404;

        if (comment.length > 500) return 400;

        const newComment = [
            board_id,
            user_id,
            comment,
            dayjs().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
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
            .query(getCommentsQuery, [board_id]);
        if (commentRows.length === 0) return 200;

        const result = await Promise.all(
            commentRows.map(async (comment) => {
                const [[userRows]] = await pool
                    .promise()
                    .query('SELECT * FROM user WHERE user_id = ?', [
                        comment.user_id,
                    ]);

                if (!userRows) return null;

                return {
                    ...comment,
                    comment_date: comment.update_date
                        ? dayjs(comment.update_date).format(
                              'YYYY년 MM월 DD일 HH:mm:ss'
                          )
                        : dayjs(comment.board_date).format(
                              'YYYY년 MM월 DD일 HH:mm:ss'
                          ),
                    nickname: userRows.nickname,
                    profile_img: userRows.profile_img && userRows.profile_img,
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
        const [boardRows] = await pool
            .promise()
            .query(getBoardQuery, [board_id]);
        if (boardRows.length === 0) return 404;

        const [commentRows] = await pool
            .promise()
            .query(getCommentQuery, [comment_id]);
        if (commentRows.length === 0) return 404;

        //NOTE: 댓글 삭제 & 게시판 댓글 갯수 업데이트
        await pool
            .promise()
            .query('DELETE FROM comment WHERE comment_id = ?', [comment_id]);
        await pool
            .promise()
            .query(
                'UPDATE boardInfo SET comment_count = comment_count - 1 WHERE board_id = ?',
                [board_id]
            );

        return { comment_id: comment_id };
    } catch (e) {
        throw new Error(`댓글 삭제중 에러 발생 => ${e}`);
    }
};

//NOTE: 댓글 수정
exports.editComment = async (board_id, comment_id, comment) => {
    try {
        const [commentRows] = await pool
            .promise()
            .query(
                'SELECT * FROM comment WHERE board_id = ? && comment_id = ?',
                [board_id, comment_id]
            );
        if (commentRows.length === 0) return 404;

        const editComment =
            'UPDATE comment SET comment = ? , update_date = ? WHERE comment_id = ?';
        await pool
            .promise()
            .query(editComment, [
                comment,
                dayjs().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
                comment_id,
            ]);

        return { comment_id: comment_id };
    } catch (e) {
        throw new Error(`댓글 수정중 에러 발생 => ${e}`);
    }
};
