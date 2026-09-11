import express from "express";
import { identifyUser } from "../middleware/auth.middleware.js";
import { 
  addStatus, 
  watchStatus, 
  getMyStatus, 
  getContactsStatuses 
} from "../controllers/status.controller.js";

const router = express.Router();

// Apply auth middleware to all story routes
router.use(identifyUser);

router.post("/add", addStatus);
router.get("/my-status", getMyStatus);
router.get("/contacts", getContactsStatuses);
router.post("/watch/:statusId", watchStatus);

export default router;
