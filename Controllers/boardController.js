const boardModel = require('../Models/boardModel');
const sanitizeHtml = require('sanitize-html');

//NOTE: 게시글 작성
exports.addBoard = async (req, res) => {
    const user_id = req.user.user_id;
    const { title, content } = req.body;
    const content_img =
        req.file &&
        req.file.location.replace(
            process.env.S3_BUCKET_URL,
            process.env.CLOUDFRONT_URL
        );

    let cleanTitle = sanitizeHtml(title);
    let cleanContent = sanitizeHtml(content);

    if (!cleanTitle && !cleanContent)
        return res
            .status(400)
            .json({ message: '입력한 값이 비어있습니다.', data: null });

    try {
        const result = await boardModel.addBoard(
            user_id,
            cleanTitle,
            cleanContent,
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
    const content_img =
        req.file &&
        req.file.location.replace(
            process.env.S3_BUCKET_URL,
            process.env.CLOUDFRONT_URL
        );
    const board_id = req.params.board_id;

    let cleanTitle = sanitizeHtml(title);
    let cleanContent = sanitizeHtml(content);

    try {
        const result = await boardModel.editBoard(
            board_id,
            cleanTitle,
            cleanContent,
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

        if (result == 404)
            return res.status(404).json({
                message: '게시글이 존재하지 않습니다!',
                dat: null,
            });

        const { totalPage, data } = JSON.parse(result);

        return res.status(200).json({
            message: '게시글 목록 조회 완료!',
            totalPage,
            data,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

//NOTE: 좋아요 증가
exports.increaseLike = async (req, res) => {
    const board_id = req.params.board_id;
    const user_id = req.user.user_id;

    try {
        const result = await boardModel.increaseLike(user_id, board_id);

        if (result == 404)
            return res.status(404).json({
                message: '존재하지 않는 게시물 입니다.',
                data: null,
            });

        if (result == 400)
            return res.status(400).json({
                message: '이미 좋아요를 눌렀습니다.',
                data: null,
            });

        return res.status(201).json({
            message: '좋아요 증가 완료',
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

//NOTE: 좋아요 감소
exports.decreaseLike = async (req, res) => {
    const board_id = req.params.board_id;
    const user_id = req.user.user_id;

    try {
        const result = await boardModel.decreaseLike(user_id, board_id);

        if (result == 404)
            return res.status(404).json({
                message: '존재하지 않는 게시물 입니다.',
                data: null,
            });

        if (result == 400)
            return res.status(400).json({
                message: '아직 좋아요를 누르지 않았습니다.',
                data: null,
            });
        return res.status(201).json({
            message: '좋아요 감소 완료',
            data: null,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

//NOTE: 좋아요 유무
exports.getLike = async (req, res) => {
    const board_id = req.params.board_id;
    const user_id = req.user.user_id;

    try {
        const result = await boardModel.getLike(user_id, board_id);

        return res.status(200).json({
            message: '좋아요 유무 응답 완료',
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
