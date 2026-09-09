import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { config } from "../config/config.js";

const setCookie = async (res, refreshToken, accessToken) => {
  res.cookie("refreshToken", refreshToken, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  res.cookie("accessToken", accessToken, {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPasswrod = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPasswrod,
    });

    const refreshToken = await generateRefreshToken(res, newUser._id);
    const accessToken = await generateAccessToken(newUser._id);

    setCookie(res, refreshToken, accessToken);

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log("error in register", error);
    res.status(500).json({ message: error.message });
  }
};



export const login = async (req ,res)=>{
  try {
    const {email ,password} = req.body;
    if(!email || !password){
      return res.status(400).json({message:"All fields are required"});
    }

    const user = await userModel.findOne({email});
    if(!user){
      return res.status(400).json({message:"User not found"});
    }

    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(!isPasswordValid){
      return res.status(400).json({message:"Invalid credentials"});
    }

    const refreshToken = await generateRefreshToken(res,user._id);
    const accessToken = await generateAccessToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setCookie(res,refreshToken,accessToken);

    return res.status(200).json({
      message:"User logged in successfully",
      user:{
        _id:user._id,
        username:user.username,
        email:user.email,
      }
    });
  } catch (error) {
    console.log("error in login",error);
    res.status(500).json({message:error.message});
  }
}


export const logout = async (req ,res)=>{
  try {
    res.cookie("refreshToken", "",{
      maxAge:15*24*60*60*1000,
      httpOnly:true,
      sameSite:"strict",
      secure:true
    });

    res.cookie("accessToken", "",{
      maxAge:15*60*1000,
      httpOnly:true,
      sameSite:"strict",
      secure:true,
    });
    
    return res.status(200).json({message:"User logged out successfully"});
  } catch (error) {
    console.log("error in logout",error);
    res.status(500).json({message:error.message});
  }
}


export const getMe = async (req ,res)=>{
  try {
    const user = await userModel.findById(req.user.userId).select("-password");
    return res.status(200).json({
      user:{
        _id:user._id, 
        username:user.username,
        email:user.email,
        profilePicture:user.profilePicture,
        status:user.status,
        lastSeen:user.lastSeen,
      }
    });
  } catch (error) {
    console.log("error in getMe",error);
    res.status(500).json({message:error.message});
  }
}


export const refreshAccessToken = async (req ,res)=>{
  try {
    const {refreshToken} = req.cookies;
    if(!refreshToken){
      return res.status(401).json({message:"Unauthorized"});
    }

    const decodedToken = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
    const user = await userModel.findById(decodedToken.userId);
    if(!user){
      return res.status(401).json({message:"Unauthorized"});
    }

    const accessToken = await generateAccessToken(user._id);
    setCookie(res,refreshToken,accessToken);
    return res.status(200).json({
      message:"Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    console.log("error in refreshAccessToken",error);
    res.status(500).json({message:error.message});
  }
}
