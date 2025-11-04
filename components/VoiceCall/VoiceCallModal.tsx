"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWebSocket } from "@/lib/useWebSocket";

interface VoiceCallModalProps {
  userId: string;
  recipientId: string;
  recipientName: string;
  isCallActive: boolean;
  callType: "incoming" | "outgoing" | null;
  onAccept: () => void;
  onReject: () => void;
  onHangup: () => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  userId,
  recipientId,
  recipientName,
  isCallActive,
  callType,
  onAccept,
  onReject,
  onHangup,
}) => {
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const { initiateCall, sendWebRTCSignal } = useWebSocket({
    userId,
  });

  // Start call
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      initiateCall(recipientId);
    } catch (error) {
      console.error("Error starting call:", error);
      onReject();
    }
  };

  // End call
  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    onHangup();
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Update call duration
  useEffect(() => {
    if (!isCallActive) {
      setCallDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCallActive]);

  // Start call when outgoing
  useEffect(() => {
    if (callType === "outgoing" && !isCallActive) {
      startCall();
    }

    return () => {
      if (isCallActive && callType === "outgoing") {
        endCall();
      }
    };
  }, [callType]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!callType) return null;

  if (callType === "incoming" && !isCallActive) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            📞 Incoming Call
          </h2>
          <p className="text-gray-300 mb-8">{recipientName} is calling...</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onAccept}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              Accept
            </button>
            <button
              onClick={onReject}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCallActive) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-900 rounded-lg p-4 w-72 border border-gray-700 z-50">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-white font-semibold">{recipientName}</h3>
            <p className="text-sm text-gray-400">{formatTime(callDuration)}</p>
          </div>
          <audio ref={localAudioRef} muted autoPlay />
          <audio ref={remoteAudioRef} autoPlay />
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={toggleMute}
            className={`px-4 py-2 rounded font-semibold transition ${
              isMuted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
          >
            {isMuted ? "🔇 Muted" : "🔊 Mute"}
          </button>
          <button
            onClick={endCall}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
          >
            End Call
          </button>
        </div>
      </div>
    );
  }

  return null;
};
