import express from "express";

import { login, logout, signup } from "../controllers/user.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/logout", isAuthenticated, logout);

export default router;
