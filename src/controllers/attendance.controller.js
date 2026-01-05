import Class from "../models/Class.js"
import { startActiveSession } from "../WebSocket/session.js"

export const startAttendance  = async (req, res) => {
  try{
    const { classId } = req.body;
    
    if(req.user.role !== "teacher") {
      return res.status(403).json({
        success: "ERROR",
        error: "Forbidden, Teacher access required",
      });
    }
    
    const cls = await Class.findById(classId);
    if(!cls){ 
      return res.status(403).json({
        success: false,
        error: "Class not Found",
      }); 
    }
    
    if(cls.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: "Forbidden, not class teacher",
      });
    }
    
    const session = startActiveSession(classId);
    
    res.json({
      success: true,
      data: {
        classId: session.classId,
        startedId: session.startedAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
}