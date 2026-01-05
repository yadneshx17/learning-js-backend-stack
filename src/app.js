import express from "express";
import dotenv  from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import classRoutes from "./routes/class.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js"

const app = express();

// global middleware
// reads raw request dat, parses JSON, attaches it to `req.body`
// raw JSON -> JS Object
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/class", classRoutes);
app.use("/attendance", attendanceRoutes);

dotenv.config();

app.get("/", async(req, res, err) => {
  console.log(req.body)
  res.json({
    sucess: true, data: "Server is healthy",
  })
})

export default app;