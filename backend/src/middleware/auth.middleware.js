import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";

export const identifyUser = async(req, res, next)=>{
  try{
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
      return res.status(401).json({message:"Unauthorized"});
    }

    const decodedToken = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
    const user = await userModel.findById(decodedToken.userId);
    if(!user){
      return res.status(401).json({message:"Unauthorized"});
    }

    req.user = user;
    res.locals.user = user;
    next();
  }catch(err){
    console.log("error in identifyUser",err);
    res.status(500).json({message:err.message});   
  }
}