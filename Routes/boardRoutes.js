const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const cookie = require('../middlewares/checkCookie');
const boardController = require('../Controllers/boardController');

//NOTE: 이미지 저장소 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../resource/boardImg'));
    },
    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() + '-' + Math.random() + path.extname(file.originalname)
        );
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
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

module.exports = router;
