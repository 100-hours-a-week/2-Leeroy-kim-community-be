exports.checkAuth = (params_id, user_id, res) => {
    if (params_id != user_id) {
        return res.status(403).json({
            message: '권한이 없습니다.',
            data: null,
        });
    }
    return true;
};
