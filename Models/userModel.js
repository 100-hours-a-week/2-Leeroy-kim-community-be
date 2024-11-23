const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const dataPath = path.join(__dirname, '../data/userInfo.json');

//NOTE: 로그인 로직
exports.loginUser = async (email, password) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        const userData = JSON.parse(data);

        const user = userData.users.find((user) => user.email === email);

        if (!user) return 404;

        const inputPassword = await crypto
            .createHash('sha256')
            .update(password + user.salt)
            .digest('hex');

        if (inputPassword === user.password) {
            return { user_id: user.user_id, nickname: user.nickname };
        } else {
            return 400;
        }
    } catch (e) {
        console.log(`로그인 로직 에러 발생 => ${e}`);
        throw new Error('로그인중 문제가 발생했습니다!');
    }
};

//NOTE: 회원가입 로직
exports.addUser = async (email, password, nickname, profile_img) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        const userData = JSON.parse(data);

        //NOTE: 이메일,닉네임 중복 확인
        const userEmail = userData.users.find((user) => user.email === email);
        if (userEmail) return 4001;
        const userNickname = userData.users.find(
            (user) => user.nickname === nickname
        );
        if (userNickname) return 4002;

        //NOTE: 이전 user_id + 1한 값을 새로운 user_id로 할당
        const lastUser = userData.users.length - 1;
        const newUserId = userData.users[lastUser].user_id + 1;

        const salt = await crypto.randomBytes(128).toString('base64');
        password = await crypto
            .createHash('sha256')
            .update(password + salt)
            .digest('hex');

        const newUser = {
            user_id: newUserId,
            email: email,
            password: password,
            salt: salt,
            nickname: nickname,
            profile_img: profile_img,
        };

        userData.users.push(newUser);
        await fs.writeFile(dataPath, JSON.stringify(userData, null, 4), 'utf8');

        //NOTE: 유저id 반환
        return newUserId;
    } catch (e) {
        console.log(`회원가입중 에러 발생 => ${e}`);
        throw new Error('회원가입중 문제가 발생했습니다!');
    }
};

//NOTE: 유저 정보 조회
exports.getUser = async (user_id) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        const userData = JSON.parse(data);

        const user = userData.users.find((user) => user.user_id == user_id);

        if (!user) return 404;

        const userInfo = {
            user_id: user.user_id,
            email: user.email,
            nickname: user.nickname,
            profile_img: `http://localhost:5050${user.profile_img}`,
        };

        return JSON.stringify(userInfo);
    } catch (e) {
        console.log(`유저 정보를 조회중 에러 발생 => ${e}`);
        throw new Error('유저 정보를 조회중 에러 발생');
    }
};

//NOTE:유저 정보 수정
exports.editUser = async (nickname, profile_img, user_id) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        const userData = JSON.parse(data);

        const user_index = userData.users.findIndex(
            (user) => user.user_id == user_id
        );
        const user = userData.users[user_index];
        if (!user) return 404;

        if (user.profile_img && profile_img) {
            const filePath = path.join(__dirname, '..', user.profile_img);

            await fs.unlink(filePath, (e) => {
                if (e) throw new Error(`이미지 삭제 실패 => ${e}`);
            });
        }

        userData.users[user_index] = {
            ...user,
            nickname: nickname || user.nickname,
            profile_img: profile_img || user.profile_img,
        };

        await fs.writeFile(dataPath, JSON.stringify(userData, null, 4), 'utf8');

        return user_id;
    } catch (e) {
        console.log(`유저 정보를 수정중 에러 발생 => ${e}`);
        throw new Error('유저 정보를 수정중 에러 발생');
    }
};

//NOTE: 회원 비밀번호 수정
exports.editPwd = async (user_id, password) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        const userData = JSON.parse(data);

        const user_index = userData.users.findIndex(
            (user) => user.user_id == user_id
        );
        const user = userData.users[user_index];
        if (!user) return 404;

        const salt = await crypto.randomBytes(128).toString('base64');
        password = await crypto
            .createHash('sha256')
            .update(password + salt)
            .digest('hex');

        userData.users[user_index] = {
            ...user,
            password: password,
            salt: salt,
        };

        await fs.writeFile(dataPath, JSON.stringify(userData, null, 4), 'utf8');

        return null;
    } catch (e) {
        console.log(`회원 비밀번호 수정중 에러 발생 =>${e}`);
        throw new Error('회원 비밀번호 수정중 에러 발생');
    }
};
