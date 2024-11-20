const userModel = require('../Models/userModel');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email && !password) {
        return res
            .status(400)
            .json({ message: '입력한 값이 비어있습니다.', data: null });
    }

    try {
        const result = await userModel.loginUser(email, password);

        if (result == 404)
            return res.status(404).json({
                message: '존재하지 않는 이메일 입니다.',
                data: null,
            });

        if (result == 400)
            return res.status(400).json({
                message: '비밀번호가 틀렸습니다.',
                data: null,
            });

        return res.status(200).json({
            message: '로그인 성공!',
            data: {
                user_id: result.user_id,
                nickname: result.nickname,
            },
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

exports.signup = async (req, res) => {
    const { email, password, nickname, profile_img } = req.body;

    if (!email && !password && !nickname)
        return res
            .status(400)
            .json({ message: '입력한 값이 비어있습니다.', data: null });

    try {
        const result = await userModel.addUser(
            email,
            password,
            nickname,
            profile_img
        );

        if (result == 400)
            return res.status(400).json({
                message: '이메일이 중복되었습니다.',
                data: null,
            });

        return res.status(201).json({
            message: '회원가입이 완료 되었습니다!',
            data: {
                user_id: result,
            },
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};
