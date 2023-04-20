const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { error, success } = require("../utils/responseWrapper");

const signupController = async(req, res) => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            // return res.status(400).send("All fields are required");
            return res.send(error(400,"All fields are required"));
        }
        
        const oldUser = await User.findOne({email});
        if(oldUser){
            // return res.status(409).send("User is already registered");
            return res.send(error(409,"User is already registered"));
        }
        
        const hashedPassword = await bcrypt.hash(password,10);
        const user = await User.create({
            name,
            email,
            password : hashedPassword
        });

        // res.status(200).send({
        //     user
        // });
        return res.send(success(200,"User created successfully"));
        

    } catch (e) {
        // res.status(404).send(e.message);
        return res.send(error(500,e.message));
    }
}


const loginController = async(req, res) => {
    try {
        const { email, password} = req.body;

        if(!email || !password){
            // return res.status(400).send("All fields are required");
            return res.send(error(400,"All fields are required"));
        }
        
        //agar password mein "select : false" kiya hua hai (schema ke andar) toh fir wo find or fineOne ko use krne se password ko nahi lega
        //toh hume findOne({email}).select("+password") -- aise likhna padega password ko lene ke liye, otherwise login hi nahi hoga
        const user = await User.findOne({email}).select("+password");
        if(!user){
            // return res.status(409).send("User is not registered");
            return res.send(error(409,"User is not registered"));
        }
        
        const matched = await bcrypt.compare(password, user.password);
        if(!matched){
            // return res.status(403).send("Incorrect password");
            return res.send(error(403,"Incorrect password"));
        }

        const accessToken = generateAccessToken({
            _id:user._id,
        });
        const refreshToken = generateRefreshToken({
            _id:user._id,
        });
        
        res.cookie('jwt',refreshToken, {
            httpOnly: true,
            secure: true
        });
        // console.log(accessToken);

        // return res.status(200).send({accessToken, refreshToken});
        return res.send(success(200,{accessToken, refreshToken}));        

    } catch (e) {
        // return res.status(404).send(e.message);
        return res.send(error(404,e.message));
    }
}

const refreshAccessTokenController = async (req, res)=>{
    const cookies = req.cookies;
    if(!cookies.jwt){
        // res.status(401).send("Refresh token in cookie is required");
        return res.send(error(401,"Refresh token in cookie is required"));
    }
    const refreshToken = cookies.jwt;
    // console.log("refresh", refreshToken);

    if(!refreshToken){
        // res.status(401).send("Refresh token is required");
        return res.send(error(401,"Refresh token is required"));
    }
    // const refreshAccessToken = generateRefreshToken({user});
    try {
        const decoded = jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_PRIVATE_KEY
            );
        const _id = decoded._id;
        const accessToken = generateAccessToken({_id});
        // return res.status(201).json({accessToken});
        return res.send(success(201,{accessToken}));
    } catch (e) {
        // return res.status(401).send("Invalid refresh token");
        return res.send(error(401,"Invalid refresh token"));
    }

}

const generateAccessToken =(data) => {
    try {
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY,{
            expiresIn: '1d'
        });
        // console.log(token);
        return token;
    } catch (error) {
        return res.send(error(401,e.message));
    }
}

//generate refresh token
const generateRefreshToken =(data) => {
    try {
        const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY,{
            expiresIn: '1y'
        });
        console.log(token);
        return token;
    } catch (error) {
        // return res.send(e.message);
        return res.send(error(401,e.message));
    }
}

const logoutController = async(req, res) => {
    try {
        res.clearCookie('jwt',{
            httpOnly:true,
            secure:true
        })
        return res.send(success(200,"user logged out successfully"));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}


module.exports = {
    signupController,
    loginController,
    refreshAccessTokenController,
    logoutController
}