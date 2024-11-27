const express = require('express');
const router = express.Router({ mergeParams: true });
const cookie = require('../middlewares/checkCookie');
const commentCtr = require('../Controllers/commentController');

//NOTE: 댓글 생성
router.post('', cookie.checkCookie, commentCtr.addComment);
//NOTE: 댓글 조회
router.get('', cookie.checkCookie, commentCtr.getComment);
//NOTE: 댓글 삭제
router.delete(
    '/:comment_id',
    cookie.checkCookie,
    cookie.checkCommentAuth,
    commentCtr.delComment
);
//NOTE: 댓글 수정
router.patch(
    '/:comment_id',
    cookie.checkCookie,
    cookie.checkCommentAuth,
    commentCtr.editComment
);
module.exports = router;
