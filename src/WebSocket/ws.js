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
          data: { message: "WebSocket authenticated", role: decoded.role },
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
                data: "Server is Alive",
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

          case "TODAY_SUMMARY":
            if (ws.user.role !== "teacher") {
              ws.send(
                JSON.stringify({
                  event: "ERROR",
                  data: {
                    message: "Forbidden, teacher event only",
                  },
                }),
              );
              break;
            }

            activeSession = getActiveSession();
            if (!activeSession) {
              ws.send(
                JSON.stringify({
                  event: "ERROR",
                  data: {
                    message: "No active attendance session",
                  },
                }),
              );
              break;
            }

            const values = Object.values(activeSession.attendance);

            const present = values.filter((v) => v === "present").length();
            const absent = values.filter((v) => v === "absent").length();

            broadcast({
              event: "TODAY_SUMMARY",
              data: {
                present,
                absent,
                total: present + absent,
              },
            });

            break;

          case "MY_ATTENDANCE":
            if (ws.user.role !== "student") {
              ws.send(
                JSON.stringify({
                  event: "ERROR",
                  data: {
                    message: "Forbidden, teacher event only",
                  },
                }),
              );
              break;
            }

            const activeSessions = getActiveSession();
            if (!activeSessions) {
              ws.send(
                JSON.stringify({
                  event: "ERROR",
                  data: {
                    message: "No active attendance session",
                  },
                }),
              );
              break;
            }

            const statuss =
              activeSessions.attendance[ws.user.userId] ?? "not yet uploaded";

            ws.send(
              JSON.stringify({
                event: "MY_ATTENDANCE",
                data: { statuss },
              }),
            );

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
