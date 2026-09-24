import mongoose from "mongoose";

const callingSchema = new mongoose.Schema({
  callerId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  recipientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
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

export const callingModel = mongoose.model("Calling",callingSchema);