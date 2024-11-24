const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../Controllers/userController');
const cookie = require('../middlewares/checkCookie');

//NOTE: 이미지 저장소 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../resource/profileImg'));
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

router.post('/login', userController.login);
router.post('/signup', upload.single('profile_img'), userController.signup);
router.post('/logout', cookie.checkCookie, userController.logout);
router.get(
    '/:id',
    cookie.checkCookie,
    cookie.checkAuth,
    userController.getUser
);
router.patch(
    '/:id',
    cookie.checkCookie,
    cookie.checkAuth,
    upload.single('profile_img'),
    userController.editUser
);
router.patch(
    '/password/:id',
    cookie.checkCookie,
    cookie.checkAuth,
    userController.editPwd
);
router.delete(
    '/:id',
    cookie.checkCookie,
    cookie.checkAuth,
    userController.delUser
);
module.exports = router;
