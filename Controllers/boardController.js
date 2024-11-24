const boardModel = require('../Models/boardModel');

//NOTE: 게시판 작성
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
            data: JSON.parse(result),
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            dta: null,
        });
    }
};

