import mongoose from "mongoose";

const contactsSchema = new mongoose.Schema({
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  contactUser:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  }
}, { timestamps: true });  

contactsSchema.index({owner:1,contactUser:1}, {unique:true});

const contactModel = mongoose.model("Contact", contactsSchema); 
export default contactModel;