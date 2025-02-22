const s3 = require('../config/s3client');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const dayjs = require('../config/day');
const pool = require('../config/db');
require('dotenv').config();

const getBoardQuery = 'SELECT * FROM boardInfo WHERE board_id = ?';

//NOTE: 게시글 작성
exports.addBoard = async (user_id, title, content, content_img) => {
    try {
        const addboardQueyr = `
            INSERT INTO boardInfo(title,content,content_img,board_date,user_id) VALUES(?)
        `;
        const values = [
            title,
            content,
            content_img || null,
            dayjs().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
            user_id,
        ];
        const [result] = await pool.promise().query(addboardQueyr, [values]);

        if (result.affectedRows > 0) {
            return result.insertId;
        } else {
            throw new Error('게시글 저장중 에러 발생');
        }
    } catch (e) {
        throw new Error(`게시글 작성중 에러 발생 => ${e}`);
    }
};

//NOTE: 게시글 상세조회
exports.getBoard = async (board_id) => {
    try {
        const [boardRows] = await pool
            .promise()
            .query(getBoardQuery, [board_id]);
        if (boardRows.length === 0) return 4041;

        const [userRows] = await pool
            .promise()
            .query('SELECT * FROM user WHERE user_id = ?', [
                boardRows[0].user_id,
            ]);
        if (userRows.length === 0) return 4042;

        //조회수 증가
        await pool
            .promise()
            .query(
                'UPDATE boardInfo SET view_count = view_count + 1 WHERE board_id = ?',
                [board_id]
            );

        const boardInfo = {
            board_id: boardRows[0].board_id,
            user_id: boardRows[0].user_id,
            title: boardRows[0].title,
            content: boardRows[0].content,
            content_img: boardRows[0].content_img && boardRows[0].content_img,
            like_count: boardRows[0].like_count,
            view_count: boardRows[0].view_count + 1,
            comment_count: boardRows[0].comment_count,
            board_date: boardRows[0].update_date
                ? dayjs(boardRows[0].update_date).format(
                      'YYYY년 MM월 DD일 HH:mm:ss'
                  )
                : dayjs(boardRows[0].board_date).format(
                      'YYYY년 MM월 DD일 HH:mm:ss'
                  ),
            nickname: userRows[0].nickname,
            profile_img: userRows[0].profile_img && userRows[0].profile_img,
        };

        return JSON.stringify(boardInfo);
    } catch (e) {
        throw new Error(`게시글 조회중 에러 발생 => ${e}`);
    }
};

//NOTE: 게시글 수정
exports.editBoard = async (board_id, title, content, content_img) => {
    try {
        const [rows] = await pool.promise().query(getBoardQuery, [board_id]);
        if (rows.length === 0) return 404;

        //NOTE: S3에 있는 기존 이미지 삭제
        if (rows[0].content_img && content_img) {
            const removeImg = rows[0].content_img.split('/boardImg/')[1];

            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `boardImg/${removeImg}`,
            };

            const command = new DeleteObjectCommand(params);
            await s3.send(command);
        }

        const updateBoardQuery = `
            UPDATE boardInfo 
            SET 
                title = IFNULL(?, title), 
                content = IFNULL(?, content), 
                content_img = IFNULL(?, content_img), 
                update_date = ?
            WHERE board_id = ?
        `;
        const values = [
            title,
            content,
            content_img,
            dayjs().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
            board_id,
        ];

        const [result] = await pool.promise().query(updateBoardQuery, values);

        if (result.affectedRows > 0) return board_id;
    } catch (e) {
        throw new Error(`게시글 수정중 에러 발생 => ${e}`);
    }
};

//NOTE: 게시글 삭제
exports.delBoard = async (board_id) => {
    try {
        const [boardRows] = await pool
            .promise()
            .query(getBoardQuery, [board_id]);
        if (boardRows.length === 0) return 404;

        await pool
            .promise()
            .query('DELETE FROM boardLike WHERE board_id = ?', [board_id]);

        await pool
            .promise()
            .query('DELETE FROM comment WHERE board_id = ?', [board_id]);

        const [result] = await pool
            .promise()
            .query('DELETE FROM boardInfo WHERE board_id = ?', [board_id]);

        if (result.affectedRows > 0) {
            const removeImg = boardRows[0].content_img.split('/boardImg/')[1];

            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `boardImg/${removeImg}`,
            };

            const command = new DeleteObjectCommand(params);
            await s3.send(command);

            return { board_id: board_id };
        }

        throw new Error('게시글 삭제중 에러 발생!');
    } catch (e) {
        throw new Error(`게시글 삭제중 에러 발생 => ${e}`);
    }
};

//NOTE:게시글 목록 조회
exports.getBoardList = async (page, limit) => {
    try {
        const startIndex = (page - 1) * limit;

        const getQuery = `
            SELECT 
                b.board_id,
                b.title,
                b.board_date,
                b.update_date,
                b.like_count,
                b.view_count,
                b.comment_count,
                b.user_id,
                u.nickname,
                u.profile_img
            FROM boardInfo b
            JOIN user u
            ON b.user_id = u.user_id
            ORDER BY b.board_id DESC
            LIMIT ? OFFSET ?;
        `;

        const [rows] = await pool
            .promise()
            .query(getQuery, [Number(limit), startIndex]);

        const [[totalPage]] = await pool
            .promise()
            .query(
                'SELECT CEIL(COUNT(*) / 5) as page FROM boardInfo WHERE user_id != 0;'
            );

        const result = rows.map((row) => {
            return {
                ...row,
                board_date: row.update_date
                    ? dayjs(row.update_date).format('YYYY년 MM월 DD일 HH:mm:ss')
                    : dayjs(row.board_date).format('YYYY년 MM월 DD일 HH:mm:ss'),
                profile_img: row.profile_img && row.profile_img,
            };
        });

        const response = {
            totalPage: totalPage.page,
            data: result,
        };

        return JSON.stringify(response);
    } catch (e) {
        throw new Error(`게시글 목록 조회중 에러 발생 => ${e}`);
    }
};

//NOTE: 좋아요 증가
exports.increaseLike = async (user_id, board_id) => {
    try {
        const [boardRows] = await pool
            .promise()
            .query(getBoardQuery, [board_id]);
        if (boardRows.length === 0) return 404;

        const [likeRows] = await pool
            .promise()
            .query(
                'SELECT * FROM boardLike WHERE board_id = ? && user_id = ?',
                [board_id, user_id]
            );
        if (likeRows.length > 0) return 400;

        await pool
            .promise()
            .query(
                'UPDATE boardInfo SET like_count = like_count + 1 WHERE board_id = ?',
                [board_id]
            );
        await pool
            .promise()
            .query('INSERT INTO boardLike(board_id,user_id) VALUES(?,?)', [
                board_id,
                user_id,
            ]);

        return { board_id: board_id };
    } catch (e) {
        throw new Error(`좋아요 증가중 에러 발생 => ${e}`);
    }
};

//NOTE: 좋아요 감소
exports.decreaseLike = async (user_id, board_id) => {
    try {
        const [boardRows] = await pool
            .promise()
            .query(getBoardQuery, [board_id]);
        if (boardRows.length === 0) return 404;

        const [likeRows] = await pool
            .promise()
            .query(
                'SELECT * FROM boardLike WHERE board_id = ? && user_id = ?',
                [board_id, user_id]
            );
        if (likeRows.length === 0) return 400;

        await pool
            .promise()
            .query(
                'UPDATE boardInfo SET like_count = like_count -1 WHERE board_id = ?',
                [board_id]
            );

        await pool
            .promise()
            .query('DELETE FROM boardLike WHERE board_id = ? && user_id = ?', [
                board_id,
                user_id,
            ]);

        return { board_id: board_id };
    } catch (e) {
        throw new Error(`좋아요 감소중 에러 발생 => ${e}`);
    }
};

//NOTE: 좋아요 유무
exports.getLike = async (user_id, board_id) => {
    try {
        const [rows] = await pool
            .promise()
            .query(
                'SELECT * FROM boardLike WHERE user_id = ? && board_id = ?',
                [user_id, board_id]
            );
        if (rows.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        throw new Error(`좋아요 확인중 에러 발생 => ${e}`);
    }
};
