import express from "express";
import { identifyUser } from "../middleware/auth.middleware.js";
import { 
  addStatus, 
  watchStatus, 
  getMyStatus, 
  getContactsStatuses 
} from "../controllers/status.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/add",identifyUser,upload.single("media"), addStatus);
router.get("/my-status", identifyUser,getMyStatus);
router.get("/contacts", identifyUser,getContactsStatuses);
router.post("/watch/:statusId", identifyUser,watchStatus);

export default router;
 