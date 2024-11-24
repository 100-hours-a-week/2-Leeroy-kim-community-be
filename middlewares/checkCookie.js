exports.checkCookie = (req, res, next) => {
    const user_id = req.cookies.user_id;

    if (!user_id)
        return res.status(401).json({
            message: '인증정보가 유효하지 않습니다.',
            data: null,
        });

    req.user = { user_id };
    next();
};

exports.checkAuth = (req, res, next) => {
    if (req.params.id != req.user.user_id) {
        return res.status(403).json({
            message: '권한이 없습니다.',
            data: null,
        });
    }

    next();
};
