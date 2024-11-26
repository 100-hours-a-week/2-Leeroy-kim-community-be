const boardModel = require('../Models/boardModel');

//NOTE: 게시글 작성
exports.addBoard = async (req, res) => {
    const user_id = req.user.user_id;
    const { title, content } = req.body;
    const content_img = req.file
        ? `/resource/boardImg/${req.file.filename}`
        : null;

    if (!title && !content)
        return res
            .status(400)
            .json({ message: '입력한 값이 비어있습니다.', data: null });

    try {
        const result = await boardModel.addBoard(
            user_id,
            title,
            content,
            content_img
        );

        return res.status(201).json({
            message: '게시글 작성 완료!',
            data: result,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

//NOTE: 게시글 상세조회
exports.getBoard = async (req, res) => {
    const board_id = req.params.board_id;

    try {
        const result = await boardModel.getBoard(board_id);

        if (result == 4041)
            return res.status(404).json({
                message: '존재하지 않는 게시글입니다.',
                data: null,
            });

        if (result == 4042)
            return res.status(404).json({
                message: '작성자가 존재하지 않습니다.',
                data: null,
            });

        return res.status(200).json({
            message: '게시글 조회 완료!',
            data: JSON.parse(result),
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

//NOTE: 게시글 수정
exports.editBoard = async (req, res) => {
    const { title, content } = req.body;
    const content_img = req.file
        ? `/resource/boardImg/${req.file.filename}`
        : null;
    const board_id = req.params.board_id;

    try {
        const result = await boardModel.editBoard(
            board_id,
            title,
            content,
            content_img
        );

        if (result == 404)
            return res.status(404).json({
                message: '존재하지 않는 게시글입니다!',
                dat: null,
            });

        return res.status(201).json({
            message: '게시글 수정 완료!',
            data: JSON.parse(result),
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

//NOTE: 게시글 삭제
exports.delBoard = async (req, res) => {
    const board_id = req.params.board_id;

    try {
        const result = await boardModel.delBoard(board_id);

        if (result == 404)
            return res.status(404).json({
                message: '존재하지 않는 회원입니다.',
                data: null,
            });

        return res.status(201).json({
            message: '게시글 삭제 완료!',
            data: result,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

//NOTE: 게시글 목록 조회
exports.getBoardList = async (req, res) => {
    const { page, limit } = req.query;

    try {
        const result = await boardModel.getBoardList(page, limit);

        return res.status(200).json({
            message: '게시글 목록 조회 완료!',
            data: JSON.parse(result),
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};
