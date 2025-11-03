// ============================================================================
// React Hook for WebSocket Communication
// ============================================================================
// This custom hook manages the WebSocket connection lifecycle and provides
// a simple interface for components to send/receive messages and typing updates.
//
// Why hooks? Hooks keep our component logic clean and reusable across components
// ============================================================================

"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// ============================================================================
// Type Definitions
// ============================================================================

// Message structure that flows through WebSocket
interface WebSocketMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

// Callback function types for different event types
type MessageHandler = (data: any) => void;
type TypingHandler = (typingUsers: string[]) => void;
type ConnectionHandler = () => void;

// ============================================================================
// useWebSocket Hook
// ============================================================================

/**
 * Custom React hook for WebSocket connection management
 *
 * Usage:
 * ```
 * const ws = useWebSocket('user-123', {
 *   onMessage: (msg) => console.log('New message:', msg),
 *   onTyping: (users) => console.log('Typing:', users),
 *   onConnect: () => console.log('Connected!'),
 * });
 *
 * ws.send('message', { text: 'Hello', receiverId: 'user-456' });
 * ws.sendTyping(true); // Notify others I'm typing
 * ws.close();
 * ```
 */
export function useWebSocket(
  userId: string,
  callbacks?: {
    onMessage?: MessageHandler;
    onTyping?: TypingHandler;
    onConnect?: ConnectionHandler;
    onDisconnect?: ConnectionHandler;
    onError?: (error: string) => void;
  }
) {
  // Reference to the WebSocket connection (persists across renders)
  const wsRef = useRef<WebSocket | null>(null);

  // State for UI: is connected?
  const [isConnected, setIsConnected] = useState(false);

  // Reference to reconnection timeout (so we can cancel it)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // How many times we've tried to reconnect (increases delay with each retry)
  const reconnectAttemptsRef = useRef(0);

  // Maximum number of reconnection attempts before giving up
  const MAX_RECONNECT_ATTEMPTS = 5;

  // =========================================================================
  // Connect to WebSocket
  // =========================================================================

  const connect = useCallback(() => {
    // Don't create multiple connections
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("[useWebSocket] Already connected");
      return;
    }

    console.log("[useWebSocket] Connecting to server...");

    try {
      // Create WebSocket connection
      // In production: use wss:// for secure WebSocket
      // For development: ws:// is fine (same server, same port)
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}`;

      const ws = new WebSocket(wsUrl);

      // =====================================================================
      // WebSocket Event Handlers
      // =====================================================================

      // Connection opened successfully
      ws.onopen = () => {
        console.log("[useWebSocket] Connected to server");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset retry counter

        // Register this client with the server
        // Send our userId so server knows which client we are
        ws.send(
          JSON.stringify({
            type: "register",
            userId: userId,
          })
        );

        // Call user's callback if provided
        callbacks?.onConnect?.();
      };

      // Message received from server
      ws.onmessage = (event: MessageEvent<string>) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("[useWebSocket] Received:", message.type);

          // Route different message types to appropriate handlers
          switch (message.type) {
            // New message from another user
            case "message":
              callbacks?.onMessage?.(message.data);
              break;

            // Typing status update (list of users currently typing)
            case "typing-update":
              callbacks?.onTyping?.(message.typingUsers);
              break;

            // Another user joined the chat
            case "user-joined":
              console.log(`[useWebSocket] User joined: ${message.userId}`);
              break;

            // Another user left the chat
            case "user-left":
              console.log(`[useWebSocket] User left: ${message.userId}`);
              break;

            // Server error response
            case "error":
              callbacks?.onError?.(message.message);
              break;

            // Acknowledge messages (we can ignore these)
            case "pong":
            case "connection-established":
            case "registration-confirmed":
              console.log("[useWebSocket] Server says:", message.message);
              break;

            default:
              console.log("[useWebSocket] Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("[useWebSocket] Failed to parse message:", error);
        }
      };

      // Connection closed (user left, server stopped, network issue, etc)
      ws.onclose = () => {
        console.log("[useWebSocket] Disconnected from server");
        setIsConnected(false);
        callbacks?.onDisconnect?.();

        // Try to reconnect automatically
        // Wait longer with each retry (exponential backoff)
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delayMs = 1000 * Math.pow(2, reconnectAttemptsRef.current);
          console.log(
            `[useWebSocket] Reconnecting in ${delayMs}ms (attempt ${
              reconnectAttemptsRef.current + 1
            })`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect(); // Recursive call to try again
          }, delayMs);
        } else {
          console.error("[useWebSocket] Max reconnection attempts reached");
          callbacks?.onError?.("Failed to maintain connection");
        }
      };

      // Connection error
      ws.onerror = (event: Event) => {
        console.error("[useWebSocket] WebSocket error:", event);
        callbacks?.onError?.("WebSocket connection error");
      };

      // Save reference so we can use it later
      wsRef.current = ws;
    } catch (error) {
      console.error("[useWebSocket] Connection failed:", error);
      callbacks?.onError?.(String(error));
    }
  }, [userId, callbacks]);

  // =========================================================================
  // Effect: Connect on component mount
  // =========================================================================

  useEffect(() => {
    connect();

    // Cleanup function: runs when component unmounts
    return () => {
      // Cancel any pending reconnect attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Close connection gracefully
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]); // Only run when connect function changes

  // =========================================================================
  // Public Functions: Send data to server
  // =========================================================================

  /**
   * Send a message through WebSocket
   * @param type - Event type (e.g. 'message', 'typing')
   * @param data - Data to send
   */
  const send = useCallback((type: string, data: any = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("[useWebSocket] Cannot send - not connected");
      return false;
    }

    try {
      // Send message as JSON string
      wsRef.current.send(
        JSON.stringify({
          type,
          ...data,
        })
      );
      console.log("[useWebSocket] Sent:", type);
      return true;
    } catch (error) {
      console.error("[useWebSocket] Send failed:", error);
      return false;
    }
  }, []);

  /**
   * Send a chat message
   * @param text - Message text
   * @param senderId - Who's sending it
   * @param receiverId - Who it's for
   */
  const sendMessage = useCallback(
    (text: string, senderId: string, receiverId: string) => {
      return send("message", {
        text,
        senderId,
        receiverId,
        id: `msg-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    },
    [send]
  );

  /**
   * Notify others that I'm typing (or stopped typing)
   * @param isTyping - true if typing, false if stopped
   */
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      return send("typing", { isTyping });
    },
    [send]
  );

  /**
   * Close the WebSocket connection
   */
  const close = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // =========================================================================
  // Return public interface
  // =========================================================================

  return {
    // Status
    isConnected,

    // Methods to send data
    send,
    sendMessage,
    sendTyping,

    // Connection management
    close,
    reconnect,

    // Raw WebSocket reference (if needed for advanced usage)
    ws: wsRef.current,
  };
}

// ============================================================================
// Export Types for use in other files
// ============================================================================

export type {
  WebSocketMessage,
  MessageHandler,
  TypingHandler,
  ConnectionHandler,
};
