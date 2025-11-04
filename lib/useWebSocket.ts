import { useEffect, useRef, useCallback, useState } from "react";

interface WebSocketMessage {
  type: string;
  from?: string;
  to?: string;
  data?: any;
  timestamp?: number;
  isTyping?: boolean;
  status?: string;
  userId?: string;
}

interface UseWebSocketOptions {
  userId: string;
  onMessage?: (message: WebSocketMessage) => void;
  onTyping?: (data: { from: string; isTyping: boolean }) => void;
  onCallSignal?: (signal: WebSocketMessage) => void;
  onFileShare?: (data: any) => void;
  onUserStatus?: (data: {
    userId: string;
    status: "online" | "offline";
  }) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const {
    userId,
    onMessage,
    onTyping,
    onCallSignal,
    onFileShare,
    onUserStatus,
    onConnected,
    onDisconnected,
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const url = `${protocol}//${window.location.host}/api/websocket?userId=${userId}`;

      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log("✓ WebSocket connected");
        setIsConnected(true);
        reconnectAttempts.current = 0;
        onConnected?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case "message":
              onMessage?.(message);
              break;
            case "typing":
              onTyping?.({
                from: message.from || "",
                isTyping: message.isTyping || false,
              });
              break;
            case "call-initiate":
            case "call-answer":
            case "call-hangup":
            case "offer":
            case "answer":
            case "ice-candidate":
              onCallSignal?.(message);
              break;
            case "file-share":
              onFileShare?.(message.data);
              break;
            case "user-status":
              onUserStatus?.({
                userId: message.userId || "",
                status: message.status as "online" | "offline",
              });
              break;
            case "connected":
              console.log("✓ Connection confirmed");
              break;
            default:
              console.log("Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current.onclose = () => {
        console.log("✗ WebSocket disconnected");
        setIsConnected(false);
        onDisconnected?.();

        if (reconnectAttempts.current < 10) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`🔄 Reconnecting (${reconnectAttempts.current})...`);
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
    }
  }, [
    userId,
    onMessage,
    onTyping,
    onCallSignal,
    onFileShare,
    onUserStatus,
    onConnected,
    onDisconnected,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    ws.current?.close();
    ws.current = null;
  }, []);

  const send = useCallback(
    (message: Partial<WebSocketMessage>) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            from: userId,
            timestamp: Date.now(),
            ...message,
          })
        );
      } else {
        console.warn("WebSocket not connected");
      }
    },
    [userId]
  );

  const sendMessage = useCallback(
    (to: string, data: any) => {
      send({
        type: "message",
        to,
        data,
      });
    },
    [send]
  );

  const sendTyping = useCallback(
    (to: string, isTyping: boolean = true) => {
      send({
        type: "typing",
        to,
        data: { isTyping },
      });
    },
    [send]
  );

  const initiateCall = useCallback(
    (to: string, data?: any) => {
      send({
        type: "call-initiate",
        to,
        data,
      });
    },
    [send]
  );

  const answerCall = useCallback(
    (to: string, data?: any) => {
      send({
        type: "call-answer",
        to,
        data,
      });
    },
    [send]
  );

  const hangupCall = useCallback(
    (to: string) => {
      send({
        type: "call-hangup",
        to,
      });
    },
    [send]
  );

  const sendWebRTCSignal = useCallback(
    (
      to: string,
      signalType: "offer" | "answer" | "ice-candidate",
      data: any
    ) => {
      send({
        type: signalType,
        to,
        data,
      });
    },
    [send]
  );

  const shareFile = useCallback(
    (to: string, fileData: any) => {
      send({
        type: "file-share",
        to,
        data: fileData,
      });
    },
    [send]
  );

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    send,
    sendMessage,
    sendTyping,
    initiateCall,
    answerCall,
    hangupCall,
    sendWebRTCSignal,
    shareFile,
    disconnect,
  };
};
