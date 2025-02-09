const crypto = require('crypto');
const pool = require('../config/db');
const s3 = require('../config/s3client');
const {
    DeleteObjectCommand,
    DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');

//NOTE: 로그인 로직
exports.loginUser = async (email, password) => {
    try {
        const [rows] = await pool
            .promise()
            .query('SELECT * FROM user WHERE email = ?', [email]);

        if (rows.length > 0) {
            const inputPassword = await crypto
                .createHash('sha256')
                .update(password + rows[0].salt)
                .digest('hex');

            if (inputPassword === rows[0].password) {
                return { user_id: rows[0].user_id, nickname: rows[0].nickname };
            } else {
                return 400;
            }
        } else {
            return 404;
        }
    } catch (e) {
        throw new Error(`로그인중 문제가 발생했습니다! => ${e}`);
    }
};

//NOTE: 회원가입 로직
exports.addUser = async (email, password, nickname, profile_img) => {
    try {
        //NOTE: 이메일,닉네임 중복 확인
        const [emailRows] = await pool
            .promise()
            .query('SELECT * FROM user WHERE email = ?', [email]);
        if (emailRows.length > 0) return 4001;

        const [nickanmeRows] = await pool
            .promise()
            .query('SELECT * FROM user WHERE nickname = ?', [nickname]);
        if (nickanmeRows.length > 0) return 4002;

        const salt = await crypto.randomBytes(128).toString('base64');
        password = await crypto
            .createHash('sha256')
            .update(password + salt)
            .digest('hex');

        const insertQuery =
            'INSERT INTO user(email,password,salt,nickname,profile_img) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool
            .promise()
            .query(insertQuery, [email, password, salt, nickname, profile_img]);

        return result.insertId;
    } catch (e) {
        throw new Error(`회원가입중 문제가 발생했습니다! => ${e}`);
    }
};

//NOTE: 회원 정보 조회
exports.getUser = async (user_id) => {
    try {
        const [rows] = await pool
            .promise()
            .query('SELECT * FROM user WHERE user_id = ?', [user_id]);

        if (rows.length > 0) {
            const userInfo = {
                user_id: rows[0].user_id,
                email: rows[0].email,
                nickname: rows[0].nickname,
                profile_img: rows[0].profile_img && rows[0].profile_img,
            };

            return JSON.stringify(userInfo);
        } else {
            return 404;
        }
    } catch (e) {
        throw new Error(`회원 정보를 조회중 에러 발생 => ${e}`);
    }
};

//NOTE:회원 정보 수정
exports.editUser = async (nickname, profile_img, user_id) => {
    try {
        const [rows] = await pool
            .promise()
            .query('SELECT * FROM user WHERE user_id = ?', [user_id]);

        if (rows.length > 0) {
            const [nicknameRows] = await pool
                .promise()
                .query('SELECT * FROM user WHERE nickname = ?', [nickname]);

            if (nicknameRows.length > 0 && user_id != nicknameRows[0].user_id)
                return 400;

            if (profile_img) {
                const removeImg = rows[0].profile_img.split('/profiles/')[1];

                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `profiles/${removeImg}`,
                };

                const command = new DeleteObjectCommand(params);
                await s3.send(command);
            }

            const updateQuery = `
                UPDATE user
                    SET nickname = IFNULL(?, nickname), profile_img = IFNULL(?, profile_img)
                    WHERE user_id = ?;
            `;
            const [result] = await pool
                .promise()
                .query(updateQuery, [nickname, profile_img, user_id]);

            if (result.affectedRows > 0) return user_id;
        } else {
            return 404;
        }
    } catch (e) {
        throw new Error(`회원 정보를 수정중 에러 발생 => ${e}`);
    }
};

//NOTE: 회원 비밀번호 수정
exports.editPwd = async (user_id, password) => {
    try {
        const [rows] = await pool
            .promise()
            .query('SELECT * FROM user WHERE user_id = ?', [user_id]);

        if (rows.length > 0) {
            const salt = await crypto.randomBytes(128).toString('base64');
            password = await crypto
                .createHash('sha256')
                .update(password + salt)
                .digest('hex');

            const [result] = await pool
                .promise()
                .query(
                    'UPDATE user SET password = ?, salt = ? WHERE user_id = ?',
                    [password, salt, user_id]
                );
            if (result.affectedRows > 0) return null;
        } else {
            return 404;
        }
    } catch (e) {
        throw new Error(`회원 비밀번호 수정중 에러 발생 => ${e}`);
    }
};

//NOTE: 회원 삭제
exports.delUser = async (user_id) => {
    try {
        const [rows] = await pool
            .promise()
            .query('SELECT * FROM user WHERE user_id = ?', [user_id]);
        if (rows.length > 0) {
            //NOTE:게시물 좋아요 갯수 업데이트 및 좋아요 테이블 데이터 삭제
            const [boardLikes] = await pool
                .promise()
                .query(
                    'SELECT board_id FROM boardLike WHERE user_id = ? ORDER BY board_id;',
                    [user_id]
                );
            for (const like of boardLikes) {
                await pool
                    .promise()
                    .query(
                        'UPDATE boardInfo SET like_count = like_count -1 WHERE board_id = ?',
                        [like.board_id]
                    );
            }

            await pool
                .promise()
                .query('DELETE FROM boardLike WHERE user_id = ?', [user_id]);

            //NOTE:게시물 댓글 갯수 업데이트 및 댓글 삭제
            const [comments] = await pool
                .promise()
                .query(
                    'SELECT board_id, COUNT(*) as comment_count FROM comment WHERE user_id = ? GROUP BY board_id;',
                    [user_id]
                );
            for (const comment of comments) {
                await pool
                    .promise()
                    .query(
                        'UPDATE boardInfo SET comment_count = comment_count - ? WHERE board_id = ?',
                        [comment.comment_count, comment.board_id]
                    );
            }
            await pool
                .promise()
                .query('DELETE FROM comment WHERE user_id = ?', [user_id]);

            //NOTE: 게시글 이미지 및 DB 회원이 작성한 게시글 삭제
            const [boardImages] = await pool
                .promise()
                .query('SELECT content_img FROM boardInfo WHERE user_id = ?', [
                    user_id,
                ]);
            const key = boardImages
                .filter((img) => img.content_img)
                .map((img) => {
                    const removeImg = img.content_img.split('/boardImg/')[1];
                    return `boardImg/${removeImg}`;
                });
            if (key.length > 0) {
                const boardParams = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Delete: {
                        Objects: key.map((key) => ({ Key: key })),
                    },
                };

                const boardCommand = new DeleteObjectsCommand(boardParams);
                await s3.send(boardCommand);
            }

            await pool
                .promise()
                .query('DELETE FROM boardInfo WHERE user_id = ?', [user_id]);

            // user 삭제(+이미지)
            const [result] = await pool
                .promise()
                .query('DELETE FROM user WHERE user_id = ?', [user_id]);

            if (result.affectedRows > 0) {
                const removeImg = rows[0].profile_img.split('/profiles/')[1];

                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `profiles/${removeImg}`,
                };

                const command = new DeleteObjectCommand(params);
                await s3.send(command);

                return { user_id: user_id };
            }

            throw new Error('회원 삭제중 에러 발생!');
        } else {
            return 404;
        }
    } catch (e) {
        throw new Error(`회원 삭제중 에러 발생 => ${e}`);
    }
};
