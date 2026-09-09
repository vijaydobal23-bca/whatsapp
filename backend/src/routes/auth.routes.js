import expres from "express";
import {
  register,
  login,
  logout,
  getMe,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { identifyUser } from "../middleware/auth.middleware.js";
import { registerValidator,loginValidator} from "../validators/auth.validator.js";

const router = expres.Router();


router.post("/register",registerValidator,register);

router.post("/login",loginValidator,login);

router.post("/logout",identifyUser,logout);

router.get("/get-me",identifyUser,getMe);

router.post("/refreshAccessToken",identifyUser,refreshAccessToken);

export default router;
