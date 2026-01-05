import express from "express";
import { startAttendance } from "../controllers/attendance.controller.js";
import { auth } from "../middlewares/auth.js"

const router = express.Router();

router.post('/start', auth, startAttendance);

export default router;
