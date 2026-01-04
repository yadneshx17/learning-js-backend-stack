import Class from "../models/Class.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";

export const createClass = async (req, res) => {
  try {
    const { className } = req.body;

    // find if existing class
    const existing_class = await Class.findOne({ className });
    if (existing_class) {
      return res.status(400).json({
        sucess: false,
        error: "Class already exists",
      });
    }

    const newClass = await Class.create({
      className,
      teacherId: req.user.userId,
      studentIds: [],
    });

    return res.status(200).json({
      sucess: true,
      data: newClass,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      sucess: false,
      error: "Server Error",
    });
  }
};

export const addStudentToClass = async (req, res) => {
  try {
    const { studentId } = req.body;
    const classId = req.params.id;

    // Find class
    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({
        success: false,
        error: "Class not found",
      });
    }

    // class ownership check
    if (cls.teacherId.toString() !== req.user.userId) {
      return res.status(404).json({
        success: false,
        error: "Forbidden, not class Teacher",
      });
    }

    // find student
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    // prevent duplicated - check if already added
    if (cls.studentIds.some((id) => id.toString() === studentId)) {
      return res.status(400).json({
        success: false,
        error: "Student already added",
      });
    }

    // add student
    cls.studentIds.push(studentId);
    await cls.save();

    res.status(200).json({
      success: true,
      data: cls,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Get all classess of a teacher
export const getClassess = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user.userId });

    res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Get one class by id
export const getClass = async (req, res) => {
  try {
    let classId = req.params.id;

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({
        success: true,
        error: "Class does not Exist",
      });
    }

    res.status(200).json({
      success: true,
      data: cls,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "_id name email",
    );

    res.json({
      success: true,
      data: students,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const myAttendance = async (req, res) => {
  try {
    const classId = req.params.id;
    const studentId = req.user.userId;

    const record = await Attendance.findOne({
      classId,
      studentId,
    });
    if (!record) {
      res.status(404).json({
        success: false,
        error: "Forbidden no record found",
      });
    }

    res.json({
      success: true,
      data: {
        classId,
        status: record ? record.status : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
