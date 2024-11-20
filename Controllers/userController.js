const userModel = require('../Models/userModel');

exports.login = async (req,res)=>{
    const loginUser = await userModel.loginUser();
    res.status(200).json({ message:'로그인 성공!' , data: loginUser });
}

exports.signup = async(req,res)=>{
    const signUp = await userModel.addUser();
    res.status(201).json({message:'회원가입 성공!', data: signUp});
}