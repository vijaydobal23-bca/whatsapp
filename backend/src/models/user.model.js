import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username : {
    type:String,
    required:[true , "username is required"],
    trim:true,
  },

  email:{
    type:String,
    required:[true , "email is required"],
    trim:true,
    lowercase:true,
    unique:true
  },

  password:{
    type:String,
    required:[true , "password is required"],
    trim:true,
    min:8,
  },

  profilePicture:{
    type:String,
    default:"", 
  },

  status:{
    type:String,
    enum:["online","offline"],
    default:"offline"
  },

  lastSeen:{
    type:Date,
    default:Date.now
  },

  refreshToken:{
    type:String,
  },

  bio:{
    type:String,
    default:"Hey there! I'm using WhatsApp.",
  },

},{timestamps:true});

const userModel = mongoose.model("user",userSchema);

export default userModel;