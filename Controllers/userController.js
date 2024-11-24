const userModel = require('../Models/userModel');

//NOTE: 로그인
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

        res.cookie('user_id', result.user_id, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
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

//NOTE: 로그아웃
exports.logout = async (req, res) => {
    try {
        res.clearCookie('user_id', {
            httpOnly: true,
        });

        return res.status(200).json({
            message: '로그아웃 성공!',
            data: req.user.user_id,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

//NOTE: 회원가입
exports.signup = async (req, res) => {
    const { email, password, nickname } = req.body;
    const profile_img = req.file && `/resource/profileImg/${req.file.filename}`;

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

        if (result == 4001)
            return res.status(400).json({
                message: '이메일이 중복되었습니다.',
                data: null,
            });
        if (result == 4002)
            return res.status(400).json({
                message: '닉네임이 중복되었습니다.',
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

//NOTE: 회원정보 조회
exports.getUser = async (req, res) => {
    const params_id = await req.params.id;

    try {
        const result = await userModel.getUser(params_id);

        if (result == 404)
            return res.status(404).json({
                message: '존재하지 않는 회웝입니다.',
                data: null,
            });

        return res.status(200).json({
            message: '회원정보를 불러왔습니다!',
            data: JSON.parse(result),
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

//NOTE: 회원정보 수정
exports.editUser = async (req, res) => {
    const { nickname } = req.body;
    const profile_img = req.file && `/resource/profileImg/${req.file.filename}`;
    const params_id = req.user.user_id;

    if (!nickname && !profile_img)
        return res.status(400).json({
            message: '입력한 값이 비었습니다.',
            data: null,
        });

    try {
        const result = await userModel.editUser(
            nickname,
            profile_img,
            params_id
        );

        if (result == 404)
            return res.status(404).json({
                message: '존재하지 않는 회웝입니다.',
                data: null,
            });

        return res.status(201).json({
            message: '회원정보를 수정 완료!',
            data: JSON.parse(result),
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

//NOTE: 회원 비밀번호 수정
exports.editPwd = async (req, res) => {
    const { password } = req.body;
    const user_id = req.user.user_id;

    if (!password)
        return res.status(400).json({
            message: '입력한 값이 비었습니다',
            data: null,
        });
    try {
        const result = await userModel.editPwd(user_id, password);

        if (result == 404)
            return res.status(404).json({
                message: '존재하지 않는 회원입니다.',
                data: null,
            });

        return res.status(201).json({
            message: '회원정보를 수정 완료!',
            data: JSON.parse(result),
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};

//NOTE: 회원 삭제
exports.delUser = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const result = await userModel.delUser(user_id);

        if (result == 404)
            return res.status(404).json({
                message: '존재하지 않는 회원입니다.',
                data: null,
            });

        return res.status(201).json({
            message: '회원 삭제 완료!',
            data: result,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: '서버에서 에러가 발생했습니다!',
            data: null,
        });
    }
};
