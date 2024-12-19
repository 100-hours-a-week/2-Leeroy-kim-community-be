const path = require('path');
const fs = require('fs').promises;
const commentPath = path.join(__dirname, '../data/commentInfo.json');
const userPath = path.join(__dirname, '../data/userInfo.json');
const boardPath = path.join(__dirname, '../data/boardInfo.json');
const dayjs = require('dayjs');

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
        const boardData = await readBoardData();
        const boardIndex = boardData.boards.findIndex(
            (board) => board.board_id == board_id
        );

        if (boardIndex == -1) return 404;

        const commentData = await readCommentData();
        let commentIndex = commentData.boards.findIndex(
            (board) => board.board_id == board_id
        );

        let newId = 0;
        //NOTE:첫 댓글일때
        if (commentIndex == -1) {
            commentData.boards.push({
                board_id: board_id,
                comment_list: [],
            });
            commentIndex = commentData.boards.length - 1;
        } else {
            const commentLength =
                commentData.boards[commentIndex].comment_list.length;
            newId =
                commentData.boards[commentIndex].comment_list[commentLength - 1]
                    .comment_id + 1;
        }

        const newComment = {
            comment_id: newId,
            comment,
            comment_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            update_date: null,
            user_id: user_id,
        };
        commentData.boards[commentIndex].comment_list.push(newComment);
        boardData.boards[boardIndex].comment_count =
            commentData.boards[commentIndex].comment_list.length;

        //NOTE: 댓글 추가
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

        return { comment_id: newId };
    } catch (e) {
        console.log(`댓글 생성중 에러 발생 => ${e}`);
        throw new Error('댓글 생성중 문제가 발생했습니다!');
    }
};

//NOTE: 댓글 조회
exports.getComment = async (board_id) => {
    try {
        const commentData = await readCommentData();
        const userData = await readUserData();
        const board = commentData.boards.find(
            (board) => board.board_id == board_id
        );

        if (!board || !board.comment_list || board.comment_list.length == 0)
            return 200;

        const result = board.comment_list.map((comment) => {
            const user = userData.users.find(
                (user) => user.user_id == comment.user_id
            );

            return {
                ...comment,
                nickname: user.nickname,
                profile_img:
                    user.profile_img != null
                        ? `http://${process.env.BACKEND_URL}:5050${user.profile_img}`
                        : null,
            };
        });

        return JSON.stringify(result);
    } catch (e) {
        console.log(`댓글 조회중 에러 발생 => ${e}`);
        throw new Error('댓글 조회중 문제가 발생했습니다!');
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
