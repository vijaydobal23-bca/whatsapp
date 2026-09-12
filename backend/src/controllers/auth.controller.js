import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { config } from "../config/config.js";
import { uploadToImageKit } from "../services/imagekit.service.js";

const setCookie = async (res, refreshToken, accessToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", refreshToken, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProduction ? "none" : "strict",
    secure: isProduction,
  });

  res.cookie("accessToken", accessToken, {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
    sameSite: isProduction ? "none" : "strict",
    secure: isProduction,
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
        profilePicture: newUser.profilePicture,
        bio: newUser.bio,
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
        profilePicture:user.profilePicture,
        bio:user.bio,
      }
    });
  } catch (error) {
    console.log("error in login",error);
    res.status(500).json({message:error.message});
  }
}


export const logout = async (req ,res)=>{
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", "",{
      maxAge:0,
      httpOnly:true,
      sameSite: isProduction ? "none" : "strict",
      secure:isProduction
    });

    res.cookie("accessToken", "",{
      maxAge:0,
      httpOnly:true,
      sameSite: isProduction ? "none" : "strict",
      secure:isProduction,
    });
    
    return res.status(200).json({message:"User logged out successfully"});
  } catch (error) {
    console.log("error in logout",error);
    res.status(500).json({message:error.message});
  }
}


export const getMe = async (req ,res)=>{
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    return res.status(200).json({
      user:{
        _id:user._id, 
        username:user.username,
        email:user.email,
        profilePicture:user.profilePicture,
        bio:user.bio,
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

export const updateProfile = async (req ,res)=>{
  try {
    const { username ,bio} = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload profile picture if provided
    if (req.file) {
      const profilePictureLink = await uploadToImageKit(req.file.buffer);
      if (!profilePictureLink) {
        return res.status(500).json({ message: "Error in uploading profile picture" });
      }
      user.profilePicture = profilePictureLink;
    }

    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    await user.save();
    
    return res.status(200).json({
      message:"Profile updated successfully",
      user:{
        _id:user._id,
        username:user.username,
        email:user.email,
        profilePicture:user.profilePicture,
        bio:user.bio,
        status:user.status,
      }
    });
  } catch (error) {
    console.log("error in updateProfile",error);
    res.status(500).json({message:error.message});
  }
}
