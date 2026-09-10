import { Router } from "express";
import { identifyUser } from "../middleware/auth.middleware.js";
import {
  addToContact,
  getMyContacts,
  removeContact,
  checkContact,
  searchUsers,
} from "../controllers/contact.controller.js";

const router = Router();

router.post("/add/:contactId", identifyUser, addToContact);
router.get("/my-contacts", identifyUser, getMyContacts);
router.delete("/remove/:contactId", identifyUser, removeContact);
router.get("/check/:contactId", identifyUser, checkContact);
router.get("/search", identifyUser, searchUsers);

export default router;
