// ============================================================================
// WebSocket Server Utilities
// ============================================================================
// This file manages the WebSocket server that handles real-time communication
// between clients. Instead of polling every 500ms, clients connect once and
// receive instant updates when messages are sent or typing indicators change.
// ============================================================================

import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { Server as HTTPServer } from "http";

// ============================================================================
// Type Definitions
// ============================================================================

// Client represents a connected WebSocket user
interface ClientConnection {
  ws: WebSocket;
  userId: string;
  isAlive: boolean;
}

// Message event that gets broadcast to all clients
interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

// Typing indicator event
interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  timestamp: number;
}

// ============================================================================
// Global WebSocket Server Instance
// ============================================================================

let wss: WebSocketServer | null = null;
// Map to store all connected clients: userId -> ClientConnection
const clients = new Map<string, ClientConnection>();
// Track which users are currently typing
const typingUsers = new Map<string, number>();

// ============================================================================
// Initialize WebSocket Server
// ============================================================================

/**
 * Initialize the WebSocket server
 * This is called once when the server starts
 *
 * @param server - The HTTP server to attach WebSocket to
 */
export function initializeWebSocketServer(server: HTTPServer | any) {
  // If already initialized, return existing instance
  if (wss) {
    return wss;
  }

  // Create new WebSocket server
  wss = new WebSocketServer({ server });

  // Handle new client connections
  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    console.log(
      "[WebSocket] New client connection from:",
      req.socket.remoteAddress
    );

    // Initial message to confirm connection
    ws.send(
      JSON.stringify({
        type: "connection-established",
        message: "Connected to chat server",
        timestamp: new Date().toISOString(),
      })
    );

    // Handle incoming messages from client
    ws.on("message", (data: string) => {
      try {
        // Parse the incoming message
        const message = JSON.parse(data);
        console.log("[WebSocket] Received event:", message.type);

        // Route message to appropriate handler
        switch (message.type) {
          // Client identifies itself with a user ID
          case "register":
            handleClientRegister(ws, message.userId);
            break;

          // New chat message from client
          case "message":
            handleNewMessage(ws, message);
            break;

          // User is typing
          case "typing":
            handleTypingIndicator(ws, message);
            break;

          // Client is checking connection (heartbeat/ping)
          case "ping":
            ws.send(JSON.stringify({ type: "pong" }));
            break;

          default:
            console.log("[WebSocket] Unknown event type:", message.type);
        }
      } catch (error) {
        console.error("[WebSocket] Error processing message:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Failed to process message",
          })
        );
      }
    });

    // Handle client disconnection
    ws.on("close", () => {
      console.log("[WebSocket] Client disconnected");
      handleClientDisconnect(ws);
    });

    // Handle WebSocket errors
    ws.on("error", (error: Error) => {
      console.error("[WebSocket] Error:", error.message);
    });
  });

  // Periodically check if clients are still alive (health check)
  const heartbeat = setInterval(() => {
    wss?.clients.forEach((ws: any) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = true;
      ws.ping();
    });
  }, 30000);

  // Cleanup when server closes
  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  return wss;
}

// ============================================================================
// Handler Functions
// ============================================================================

/**
 * Register a client with a user ID
 * Now the server knows which user this WebSocket connection belongs to
 */
function handleClientRegister(ws: WebSocket, userId: string) {
  console.log(`[WebSocket] Client registered: ${userId}`);

  // Store this connection with the user ID
  clients.set(userId, {
    ws,
    userId,
    isAlive: true,
  });

  // Notify all clients that a user joined
  broadcastToAll({
    type: "user-joined",
    userId,
    timestamp: new Date().toISOString(),
  });

  // Send confirmation to the client
  ws.send(
    JSON.stringify({
      type: "registration-confirmed",
      userId,
      connectedUsers: Array.from(clients.keys()),
    })
  );
}

/**
 * Handle a new chat message
 * Save to database AND broadcast to all connected clients
 */
function handleNewMessage(ws: WebSocket, data: any) {
  console.log("[WebSocket] Broadcasting new message from:", data.senderId);

  // Find which user sent this message
  let senderId = "";
  for (const [userId, client] of clients.entries()) {
    if (client.ws === ws) {
      senderId = userId;
      break;
    }
  }

  // Message object to broadcast
  const message: ChatMessage = {
    id: data.id || `msg-${Date.now()}`,
    text: data.text,
    senderId: data.senderId || senderId,
    receiverId: data.receiverId,
    createdAt: data.createdAt || new Date().toISOString(),
  };

  // Broadcast to all connected clients
  broadcastToAll({
    type: "message",
    data: message,
  });

  // Clear typing indicator when message sent
  typingUsers.delete(senderId);
}

/**
 * Handle typing indicator
 * Broadcast to all clients when user starts/stops typing
 */
function handleTypingIndicator(ws: WebSocket, data: any) {
  // Find which user is typing
  let userId = "";
  for (const [uid, client] of clients.entries()) {
    if (client.ws === ws) {
      userId = uid;
      break;
    }
  }

  if (!userId) return;

  const now = Date.now();

  if (data.isTyping) {
    // Mark user as typing
    typingUsers.set(userId, now);
    console.log(`[WebSocket] ${userId} is typing`);
  } else {
    // Remove from typing list
    typingUsers.delete(userId);
    console.log(`[WebSocket] ${userId} stopped typing`);
  }

  // Broadcast current typing users to all clients
  broadcastToAll({
    type: "typing-update",
    typingUsers: Array.from(typingUsers.keys()),
    timestamp: now,
  });
}

/**
 * Handle client disconnection
 * Remove client from connections and notify others
 */
function handleClientDisconnect(ws: WebSocket) {
  let disconnectedUserId = "";

  // Find which user this connection belonged to
  for (const [userId, client] of clients.entries()) {
    if (client.ws === ws) {
      disconnectedUserId = userId;
      clients.delete(userId);
      typingUsers.delete(userId);
      break;
    }
  }

  if (disconnectedUserId) {
    console.log(`[WebSocket] User disconnected: ${disconnectedUserId}`);

    // Notify all remaining clients
    broadcastToAll({
      type: "user-left",
      userId: disconnectedUserId,
      timestamp: new Date().toISOString(),
    });
  }
}

// ============================================================================
// Broadcast Functions
// ============================================================================

/**
 * Broadcast a message to ALL connected clients
 * Used for global events like messages, typing, user join/leave
 */
function broadcastToAll(data: any) {
  if (!wss) return;

  const message = JSON.stringify(data);
  let successCount = 0;

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      successCount++;
    }
  });

  console.log(`[WebSocket] Broadcast to ${successCount} clients:`, data.type);
}

/**
 * Send a message to a specific user
 * Useful for direct messages or targeted events
 */
export function sendToUser(userId: string, data: any) {
  const client = clients.get(userId);

  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(data));
    console.log(`[WebSocket] Message sent to ${userId}:`, data.type);
    return true;
  }

  console.log(`[WebSocket] Could not send to ${userId} - not connected`);
  return false;
}

/**
 * Get all currently connected user IDs
 * Useful for status displays
 */
export function getConnectedUsers(): string[] {
  return Array.from(clients.keys());
}

/**
 * Get current typing users
 */
export function getTypingUsers(): string[] {
  return Array.from(typingUsers.keys());
}

/**
 * Close WebSocket server gracefully
 */
export function closeWebSocketServer() {
  if (wss) {
    console.log("[WebSocket] Closing server");
    wss.close();
    wss = null;
    clients.clear();
    typingUsers.clear();
  }
}

// Export server instance getter
export function getWebSocketServer(): WebSocketServer | null {
  return wss;
}
