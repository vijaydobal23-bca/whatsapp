import mongoose from "mongoose";
import { type } from "node:os";
const callingSchame = new mongoose.Schema({
  callerId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  recipientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  callType:{
    type:String,
    enum:["audio","video"]
  },
  status:{
    type:String,
    enum:["calling","accepted","rejected","missed","ended"],
    default:"calling"
  },

  callDuration:{
    type:Number,
    default:0
  },
  
},{
  timestamps:true
})

export const callingModel = mongoose.model("Calling",callingSchame);