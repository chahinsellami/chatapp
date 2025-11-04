import { WebSocketServer, WebSocket, RawData } from "ws";
import { IncomingMessage } from "http";
import { Server as HTTPServer } from "http";

interface WebSocketClientExt extends WebSocket {
  isAlive?: boolean;
}

interface WebSocketClient {
  userId: string;
  ws: WebSocketClientExt;
  isAlive: boolean;
}

interface WebSocketMessage {
  type:
    | "message"
    | "typing"
    | "call-initiate"
    | "call-answer"
    | "call-hangup"
    | "file-share"
    | "offer"
    | "answer"
    | "ice-candidate";
  from: string;
  to?: string;
  data: any;
  timestamp: number;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  initialize(server: HTTPServer) {
    this.wss = new WebSocketServer({ server });

    this.wss.on("connection", this.handleConnection.bind(this));

    // Heartbeat interval to keep connections alive
    setInterval(() => {
      this.wss?.clients.forEach((ws: WebSocketClientExt) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    console.log("✓ WebSocket server initialized");
  }

  private handleConnection(ws: WebSocketClientExt, req: IncomingMessage) {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      ws.close(1008, "Missing userId parameter");
      return;
    }

    ws.isAlive = true;

    // Store client
    const client: WebSocketClient = {
      userId,
      ws,
      isAlive: true,
    };

    this.clients.set(userId, client);
    console.log(`✓ User connected: ${userId}`);

    // Send connection confirmation
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "Connected to WebSocket server",
      })
    );

    // Broadcast user online status
    this.broadcastUserStatus(userId, "online");

    ws.on("message", (data: RawData) => this.handleMessage(userId, data));
    ws.on("pong", () => {
      const client = this.clients.get(userId);
      if (client) client.isAlive = true;
    });
    ws.on("close", () => this.handleDisconnect(userId));
    ws.on("error", (error) =>
      console.error(`WebSocket error for ${userId}:`, error)
    );
  }

  private handleMessage(userId: string, data: RawData) {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      switch (message.type) {
        case "message":
          this.handleDirectMessage(message);
          break;
        case "typing":
          this.handleTypingIndicator(userId, message);
          break;
        case "call-initiate":
          this.handleCallInitiate(message);
          break;
        case "call-answer":
          this.handleCallAnswer(message);
          break;
        case "call-hangup":
          this.handleCallHangup(message);
          break;
        case "file-share":
          this.handleFileShare(message);
          break;
        case "offer":
        case "answer":
        case "ice-candidate":
          this.forwardWebRTCSignal(message);
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  private handleDirectMessage(message: WebSocketMessage) {
    if (!message.to) return;

    const recipient = this.clients.get(message.to);
    if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
      recipient.ws.send(
        JSON.stringify({
          type: "message",
          from: message.from,
          data: message.data,
          timestamp: message.timestamp,
        })
      );
    }
  }

  private handleTypingIndicator(userId: string, message: WebSocketMessage) {
    const recipientId = message.to;
    if (!recipientId) return;

    // Clear existing timeout for this user
    const timeoutKey = `${userId}-${recipientId}`;
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
    }

    // Send typing indicator
    const recipient = this.clients.get(recipientId);
    if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
      recipient.ws.send(
        JSON.stringify({
          type: "typing",
          from: userId,
          isTyping: true,
        })
      );
    }

    // Set timeout to clear typing indicator after 3 seconds
    const timeout = setTimeout(() => {
      if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
        recipient.ws.send(
          JSON.stringify({
            type: "typing",
            from: userId,
            isTyping: false,
          })
        );
      }
      this.typingTimeouts.delete(timeoutKey);
    }, 3000);

    this.typingTimeouts.set(timeoutKey, timeout);
  }

  private handleCallInitiate(message: WebSocketMessage) {
    if (!message.to) return;
    const recipient = this.clients.get(message.to);
    if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
      recipient.ws.send(
        JSON.stringify({
          type: "call-initiate",
          from: message.from,
          data: message.data,
        })
      );
    }
  }

  private handleCallAnswer(message: WebSocketMessage) {
    if (!message.to) return;
    const caller = this.clients.get(message.to);
    if (caller && caller.ws.readyState === WebSocket.OPEN) {
      caller.ws.send(
        JSON.stringify({
          type: "call-answer",
          from: message.from,
          data: message.data,
        })
      );
    }
  }

  private handleCallHangup(message: WebSocketMessage) {
    if (!message.to) return;
    const otherUser = this.clients.get(message.to);
    if (otherUser && otherUser.ws.readyState === WebSocket.OPEN) {
      otherUser.ws.send(
        JSON.stringify({
          type: "call-hangup",
          from: message.from,
        })
      );
    }
  }

  private handleFileShare(message: WebSocketMessage) {
    if (!message.to) return;
    const recipient = this.clients.get(message.to);
    if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
      recipient.ws.send(
        JSON.stringify({
          type: "file-share",
          from: message.from,
          data: message.data,
          timestamp: message.timestamp,
        })
      );
    }
  }

  private forwardWebRTCSignal(message: WebSocketMessage) {
    if (!message.to) return;
    const recipient = this.clients.get(message.to);
    if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
      recipient.ws.send(
        JSON.stringify({
          type: message.type,
          from: message.from,
          data: message.data,
        })
      );
    }
  }

  private handleDisconnect(userId: string) {
    this.clients.delete(userId);

    // Clear typing timeouts for this user
    Array.from(this.typingTimeouts.entries()).forEach(([key, timeout]) => {
      if (key.startsWith(userId + "-")) {
        clearTimeout(timeout);
        this.typingTimeouts.delete(key);
      }
    });

    console.log(`✗ User disconnected: ${userId}`);
    this.broadcastUserStatus(userId, "offline");
  }

  private broadcastUserStatus(userId: string, status: "online" | "offline") {
    const statusMessage = JSON.stringify({
      type: "user-status",
      userId,
      status,
    });

    this.clients.forEach((client) => {
      if (client.userId !== userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(statusMessage);
      }
    });
  }

  getConnectedUsers(): string[] {
    return Array.from(this.clients.keys());
  }

  isUserOnline(userId: string): boolean {
    const client = this.clients.get(userId);
    return client ? client.ws.readyState === WebSocket.OPEN : false;
  }

  getWebSocketServer(): WebSocketServer | null {
    return this.wss;
  }
}

export const wsManager = new WebSocketManager();
