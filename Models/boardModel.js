const path = require('path');
const fs = require('fs').promises;
const boardPath = path.join(__dirname, '../data/boardInfo.json');
const userPath = path.join(__dirname, '../data/userInfo.json');
const dayjs = require('dayjs');

const readBoardData = async () => {
    const data = await fs.readFile(boardPath, 'utf8');
    return JSON.parse(data);
};

const readUserData = async () => {
    const data = await fs.readFile(userPath, 'utf8');
    return JSON.parse(data);
};

//NOTE: 게시글 작성
exports.addBoard = async (user_id, title, content, content_img) => {
    try {
        const boardData = await readBoardData();

        const lastBoard = boardData.boards.length - 1;
        const newBoardId = boardData.boards[lastBoard].board_id + 1;

        const newBoard = {
            board_id: newBoardId,
            title,
            content,
            content_img: content_img,
            board_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            update_date: null,
            like_count: 0,
            view_count: 0,
            comment_count: 0,
            user_id,
        };

        boardData.boards.push(newBoard);
        await fs.writeFile(
            boardPath,
            JSON.stringify(boardData, null, 4),
            'utf8'
        );

        return { board_id: newBoardId };
    } catch (e) {
        console.log(`게시글 작성중 에러 발생 => ${e}`);
        throw new Error('게시글 작성중 문제가 발생했습니다!');
    }
};

//NOTE: 게시글 상세조회
exports.getBoard = async (board_id) => {
    try {
        const boardData = await readBoardData();
        const boardId = boardData.boards.findIndex(
            (board) => board.board_id == board_id
        );
        const board = boardData.boards[boardId];
        if (!board) return 4041;

        const userData = await readUserData();
        const user = userData.users.find(
            (user) => user.user_id == board.user_id
        );

        if (!user) return 4042;

        boardData.boards[boardId].view_count += 1;
        await fs.writeFile(
            boardPath,
            JSON.stringify(boardData, null, 4),
            'utf8'
        );

        const boardInfo = {
            ...board,
            content_img:
                board.content_img != null
                    ? `http://localhost:5050${board.content_img}`
                    : null,
            nickname: user.nickname,
            profile_img:
                user.profile_img != null
                    ? `http://localhost:5050${user.profile_img}`
                    : null,
        };

        return JSON.stringify(boardInfo);
    } catch (e) {
        console.log(`게시글 조회중 에러 발생 => ${e}`);
        throw new Error('게시글 조회중 문제가 발생했습니다!');
    }
};

//NOTE: 게시글 수정
exports.editBoard = async (board_id, title, content, content_img) => {
    try {
        const boardData = await readBoardData();
        const boardIndex = boardData.boards.findIndex(
            (board) => board.board_id == board_id
        );
        const board = boardData.boards[boardIndex];
        if (!board) return 404;

        if (board.content_img && content_img) {
            const filePath = path.join(__dirname, '..', board.content_img);

            await fs.unlink(filePath, (e) => {
                if (e) throw new Error(`게시글 이미지 삭제 실패 =>${e}`);
            });
        }

        boardData.boards[boardIndex] = {
            ...board,
            title: title || board.title,
            update_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            content: content || board.content,
            content_img: content_img || board.content_img,
        };

        await fs.writeFile(
            boardPath,
            JSON.stringify(boardData, null, 4),
            'utf8'
        );

        return board_id;
    } catch (e) {
        console.log(`게시글 수정중 에러 발생 => ${e}`);
        throw new Error('게시글 수정중 문제가 발생했습니다!');
    }
};

//NOTE: 게시글 삭제
exports.delBoard = async (board_id) => {
    try {
        const boardData = await readBoardData();
        const boardIndex = boardData.boards.findIndex(
            (board) => board.board_id == board_id
        );
        const board = boardData.boards[boardIndex];
        if (!board) return 404;

        boardData.boards.splice(boardIndex, 1);

        await fs.writeFile(
            boardPath,
            JSON.stringify(boardData, null, 4),
            'utf8'
        );

        if (board.content_img) {
            const filePath = path.join(__dirname, '..', board.content_img);

            await fs.unlink(filePath, (e) => {
                if (e) throw new Error(`이미지 삭제 실패 => ${e}`);
            });
        }

        return { board_id: board_id };
    } catch (e) {
        console.log(`게시글 삭제중 에러 발생 => ${e}`);
        throw new Error('게시글 수정중 문제가 발생했습니다!');
    }
};
