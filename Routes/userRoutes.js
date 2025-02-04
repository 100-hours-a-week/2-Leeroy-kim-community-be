const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3client');
const path = require('path');
const userController = require('../Controllers/userController');
const cookie = require('../middlewares/checkCookie');

//NOTE: 이미지 저장소 설정
const storage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

        cb(null, `profiles/${uniqueSuffix}${path.extname(file.originalname)}`);
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

router.post('/login', userController.login);
router.post('/signup', upload.single('profile_img'), userController.signup);
router.post('/logout', cookie.checkCookie, userController.logout);
//NOTE:회원 정보 조회
router.get('', cookie.checkCookie, userController.getUser);
//NOTE:회원 정보 수정
router.patch(
    '',
    cookie.checkCookie,
    upload.single('profile_img'),
    userController.editUser
);

//NOTE:회원 비밀번호 수정
router.patch('/password', cookie.checkCookie, userController.editPwd);
//NOTE:회원 탈퇴
router.delete('', cookie.checkCookie, userController.delUser);
module.exports = router;
