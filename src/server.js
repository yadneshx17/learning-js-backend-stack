import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

import { initWebSocket } from "./WebSocket/ws.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    initWebSocket(server);

    server.listen(PORT, () => {
      console.log(`
        Server running on port ${PORT}
        `);
    });
  } catch (err) {
    console.error("Failed to start server ", err);
    process.exit(1);
  }
};

startServer();
