import ImageKit from "imagekit";
import { config } from "../config/config.js";


const imagekit = new ImageKit({
  publicKey: config.IMAGEKIT_PUBLIC_KEY,
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint:config.IMAGEKIT_ENDPOINT,
}); 

export const uploadToImageKit = async (file) => {
  try {
    const result = await imagekit.upload({
      file:file,
      fileName: "profile.jpg",
      folder:"whatsapp/"
    });
    return result.url;
  } catch (error) {
    console.log("error in uploadImage", error);
    throw new Error(error.message);
  }
} 