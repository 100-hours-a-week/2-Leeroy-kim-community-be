const path = require('path');
const fs = require('fs').promises;
const dataPath = path.join(__dirname, '../data/boardInfo.json');
const dayjs = require('dayjs');

//NOTE: 게시판 작성
exports.addBoard = async (user_id, title, content, content_img) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        const boardData = JSON.parse(data);

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
            dataPath,
            JSON.stringify(boardData, null, 4),
            'utf8'
        );

        return newBoardId;
    } catch (e) {
        console.log(`게시판 작성중 에러 발생 => ${e}`);
        throw new Error('게시판 작성중 문제가 발생했습니다!');
    }
};
