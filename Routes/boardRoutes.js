const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3client');
const cookie = require('../middlewares/checkCookie');
const boardController = require('../Controllers/boardController');

//NOTE: 이미지 저장소 설정
const storage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

        cb(null, `boardImg/${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extName = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    if (extName) {
        cb(null, true);
    } else {
        cb(new Error('이미지 파일만 업로드 가능합니다!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter,
});

//NOTE:게시글 작성
router.post(
    '',
    cookie.checkCookie,
    upload.single('content_img'),
    boardController.addBoard
);
//NOTE:게시글 상세 조회
router.get('/:board_id', cookie.checkCookie, boardController.getBoard);
//NOTE:게시글 수정
router.patch(
    '/:board_id',
    cookie.checkCookie,
    cookie.checkBoardAuth,
    upload.single('content_img'),
    boardController.editBoard
);
//NOTE:게시글 삭제
router.delete(
    '/:board_id',
    cookie.checkCookie,
    cookie.checkBoardAuth,
    boardController.delBoard
);
//NOTE:게시글 목록 조회
router.get('', cookie.checkCookie, boardController.getBoardList);
//NOTE;좋아요 증가
router.post(
    '/like/:board_id',
    cookie.checkCookie,
    boardController.increaseLike
);
//NOTE:좋아요 감소
router.post(
    '/unlike/:board_id',
    cookie.checkCookie,
    boardController.decreaseLike
);
//NOTE:좋아요 유무
router.get('/like/:board_id', cookie.checkCookie, boardController.getLike);

module.exports = router;
