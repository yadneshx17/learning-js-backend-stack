export const teacherOnly = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(300).json({
      success: false,
      error: "Forbidden, teacher access required"
    })
  }
  next();
}

// Not Necessarily required as there's only two roles
export const studentOnly = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(300).json({
      success: false,
      error: "Forbidden, teacher access required"
    })
  }
  next();
}