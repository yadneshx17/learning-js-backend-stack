import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { getActiveSession } from "./session.js";

export const initWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  // Broadcast message
  const broadcast = (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState == 1) {
        client.send(JSON.stringify(message));
      }
    });
  };

  wss.on("connection", (ws, req) => {
    try {
      // 1. extract token from query
      const url = new URL(req.url, "http://localhost");
      const token = url.searchParams.get("token");

      if (!token) {
        ws.send(
          JSON.stringify({
            event: "ERROR",
            data: { message: "Unauthorized or invalid token" },
          }),
        );
        ws.close();
        return;
      }

      // verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 3. attach user info to socket
      ws.user = {
        userId: decoded.userId,
        role: decoded.role,
      };

      console.log("WS authenticated:", ws.user);

      // 4. confirm connection
      ws.send(
        JSON.stringify({
          event: "CONNECTED",
          data: { message: "WebSocket authenticated" },
        }),
      );

      ws.on("message", (raw) => {
        let message;

        try {
          message = JSON.parse(raw.toString());
        } catch {
          ws.send(
            JSON.stringify({
              event: "ERROR",
              data: { message: "Invalid message format" },
            }),
          );
          return;
        }

        const { event, data } = message;

        switch (event) {
          case "PING":
            ws.send(
              JSON.stringify({
                event: "PONG",
                data: "alive",
              }),
            );
            break;

          case "ATTENDANCE_MARKED":
            // must be a teacher
            if (ws.user.role !== "teacher") {
              ws.send(
                JSON.stringify({
                  event: "ERROR",
                  data: { message: "Forbidden, teacher only event." },
                }),
              );
              break;
            }
            
            
            const activeSession = getActiveSession();
            // session must exist
            if (!activeSession) {
              ws.send(
                JSON.stringify({
                  event: "ERROR",
                  data: { message: "No active attendance session" },
                }),
              );
              break;
            }

            const { studentId, status } = data;

            if (!studentId || !["present", "absent"].includes(status)) {
              ws.send(
                JSON.stringify({
                  event: "ERROR",
                  data: "Invalid attendance data",
                }),
              );
            }
            
            activeSession.attendance[studentId] = status;
            
            broadcast({
              event: "ATTENDANCE_MARKED",
              data: { studentId, status },
            });
            
            break;

          default:
            ws.send(
              JSON.stringify({
                event: "ERROR",
                data: { message: "Unknown event" },
              }),
            );
        }
      });
    } catch (err) {
      ws.send(
        JSON.stringify({
          event: "ERROR",
          data: { message: "Unauthorized or invalid token" },
        }),
      );
      ws.close();
    }
  });
};
