const commentModel = require('../Models/commentModel');

//NOTE: 댓글 생성
exports.addComment = async (req, res) => {
    const board_id = req.params.board_id;
    const user_id = req.user.user_id;
    const { comment } = req.body;

    try {
        const result = await commentModel.addComments(
            board_id,
            user_id,
            comment
        );

        if (result == 404)
            return res.status(404).json({
                message: '존재하지 않는 게시글 입니다.',
                data: null,
            });

        return res.status(201).json({
            message: '댓글 작성 완료!',
            data: result,
        });
    } catch (e) {
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

//NOTE: 댓글 삭제
exports.delComment = async (req, res) => {
    const { board_id, comment_id } = req.info;

    try {
        const result = await commentModel.delComment(board_id, comment_id);

        return res.status(201).json({
            message: '댓글 삭제 완료!',
            data: result,
        });
    } catch (e) {
        console.log(e);
        return res.statu(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};
//NOTE: 댓글 수정
//NOTE: 댓글 조회
