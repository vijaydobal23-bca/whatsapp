import { Router } from "express";
import { initiateCall, handleCallResponse, getCallHistory } from "../controllers/calling.controller.js";
import { identifyUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", identifyUser, initiateCall);
router.post("/response", identifyUser, handleCallResponse);
router.get("/callhistory", identifyUser, getCallHistory);

export default router;