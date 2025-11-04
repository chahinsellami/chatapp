import { createServer } from "http";
import { parse as parseUrl } from "url";
import next from "next";
import { wsManager } from "./lib/websocket-server";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parseUrl(req.url || "", true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  wsManager.initialize(server);

  server.on("upgrade", (req, socket, head) => {
    const parsedUrl = parseUrl(req.url || "", true);
    const pathname = parsedUrl.pathname;

    if (pathname === "/api/websocket") {
      const userId = parsedUrl.query.userId as string;
      if (!userId) {
        socket.destroy();
        return;
      }

      const wss = wsManager.getWebSocketServer();
      if (wss) {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit("connection", ws, req);
        });
      }
    } else {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    console.log(`\n🚀 WebSocket server ready on http://localhost:${port}`);
    console.log(
      `📡 ws://localhost:${port}/api/websocket?userId=YOUR_USER_ID\n`
    );
  });

  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    server.close(() => process.exit(0));
  });
});
