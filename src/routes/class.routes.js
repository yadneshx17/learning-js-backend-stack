import express from "express";
import { auth } from "../middlewares/auth.js";
import { createClass, addStudentToClass, getClassess, getClass, getStudents, myAttendance } from "../controllers/class.controller.js";
import { teacherOnly, studentOnly } from "../middlewares/role.js";

const router = express.Router();

router.post("/", auth, teacherOnly, createClass);
router.post("/:id/add-student", auth, teacherOnly, addStudentToClass);

// list
router.get("/", auth, teacherOnly, getClassess);
router.get("/students", auth, teacherOnly, getStudents);

// Dynamic Route
router.get("/:id", auth, getClass);
router.get("/:id/my-attendance", auth, myAttendance);

export default router;