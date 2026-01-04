import express from "express";
import dotenv  from "dotenv";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// global middleware
// reads raw request dat, parses JSON, attaches it to `req.body`
// raw JSON -> JS Object
app.use(express.json());

app.use("/auth", authRoutes);

dotenv.config();

app.get("/", async(req, res, err) => {
  console.log(req.body)
  res.json({
    sucess: true, data: "Server is healthy",
  })
})

export default app;