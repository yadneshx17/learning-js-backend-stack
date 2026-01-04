import express from "express";
import { signup, login , me } from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", auth, me);

export default router;