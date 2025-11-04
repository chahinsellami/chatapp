import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

export function initializeSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io/",
  });

  const users = new Map<string, string>(); // userId -> socketId
  const socketToUser = new Map<string, string>(); // socketId -> userId

  io.on("connection", (socket) => {
    console.log("✓ Socket connected:", socket.id);

    // User joins with their ID
    socket.on("join", (userId: string) => {
      console.log(`👤 User ${userId} joined with socket ${socket.id}`);
      users.set(userId, socket.id);
      socketToUser.set(socket.id, userId);

      console.log(`📊 Active users: ${Array.from(users.keys()).join(", ")}`);

      // Notify others that user is online
      socket.broadcast.emit("user-online", userId);
    });

    // Send message
    socket.on(
      "send-message",
      (data: {
        messageId: string;
        senderId: string;
        receiverId: string;
        text: string;
        createdAt: string;
      }) => {
        console.log("📨 Message received on server:", {
          messageId: data.messageId,
          from: data.senderId,
          to: data.receiverId,
          text: data.text.substring(0, 20) + "...",
        });

        const receiverSocketId = users.get(data.receiverId);
        console.log(`👤 Receiver ${data.receiverId} socket:`, receiverSocketId);

        if (receiverSocketId) {
          // Send to specific user
          console.log(`✅ Sending message to socket ${receiverSocketId}`);
          io.to(receiverSocketId).emit("receive-message", data);
        } else {
          console.log(`❌ Receiver ${data.receiverId} not connected`);
        }

        // Confirm to sender
        socket.emit("message-sent", { messageId: data.messageId });
      }
    );

    // Typing indicator
    socket.on(
      "typing",
      (data: { senderId: string; receiverId: string; isTyping: boolean }) => {
        const receiverSocketId = users.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("user-typing", {
            userId: data.senderId,
            isTyping: data.isTyping,
          });
        }
      }
    );

    // WebRTC Signaling for Voice/Video Calls
    socket.on(
      "call-user",
      (data: {
        to: string;
        from: string;
        signal: any;
        callType: "voice" | "video";
      }) => {
        console.log(`Call from ${data.from} to ${data.to}`);
        const receiverSocketId = users.get(data.to);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("incoming-call", {
            from: data.from,
            signal: data.signal,
            callType: data.callType,
          });
        }
      }
    );

    socket.on("accept-call", (data: { to: string; signal: any }) => {
      const callerSocketId = users.get(data.to);

      if (callerSocketId) {
        io.to(callerSocketId).emit("call-accepted", {
          signal: data.signal,
        });
      }
    });

    socket.on("reject-call", (data: { to: string }) => {
      const callerSocketId = users.get(data.to);

      if (callerSocketId) {
        io.to(callerSocketId).emit("call-rejected");
      }
    });

    socket.on("end-call", (data: { to: string }) => {
      const otherUserSocketId = users.get(data.to);

      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit("call-ended");
      }
    });

    // ICE candidate exchange
    socket.on("ice-candidate", (data: { to: string; candidate: any }) => {
      const receiverSocketId = users.get(data.to);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("ice-candidate", {
          candidate: data.candidate,
        });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      const userId = socketToUser.get(socket.id);

      if (userId) {
        console.log(`User ${userId} disconnected`);
        users.delete(userId);
        socketToUser.delete(socket.id);

        // Notify others that user is offline
        socket.broadcast.emit("user-offline", userId);
      }
    });
  });

  console.log("✓ Socket.IO server initialized");
  return io;
}
