import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const REFRESH_TOKEN_SECRET = config.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_SECRET = config.ACCESS_TOKEN_SECRET;

export const generateRefreshToken = async (res , userId)=>{
  return jwt.sign(
    {userId},
    REFRESH_TOKEN_SECRET,
    {expiresIn:"7d"}
  );

}

export const generateAccessToken = async(userId)=>{
  return jwt.sign(
    {userId},
    ACCESS_TOKEN_SECRET,
    {expiresIn:"15m"}
  );

}