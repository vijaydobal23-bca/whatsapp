import mongoose from "mongoose";
import { config } from "./config.js";
import dns from "dns";

dns.setDefaultResultOrder('ipv4first');

const MONGO_URI = config.MONGO_URI;


export const connectDb = async ()=>{
  try {
    await mongoose.connect(MONGO_URI)
    console.log(`MONGODB is connected`);
  } catch (error) { 
    throw new Error(error.message);
  }
}


