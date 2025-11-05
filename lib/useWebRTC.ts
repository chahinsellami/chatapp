"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import Peer from "simple-peer";

export type CallType = "voice" | "video";

interface UseWebRTCProps {
  socket: Socket | null;
  userId: string | null;
}

export function useWebRTC({ socket, userId }: UseWebRTCProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callType, setCallType] = useState<CallType | null>(null);
  const [callerInfo, setCallerInfo] = useState<{
    id: string;
    name: string;
    signal: any;
  } | null>(null);

  const peerRef = useRef<Peer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const otherUserIdRef = useRef<string | null>(null); // Track the other user in the call
  const hasInitiatedCallRef = useRef(false); // Track if call was initiated to prevent duplicate signals

  useEffect(() => {
    if (!socket || !userId) return;

    // Handle incoming call
    socket.on(
      "incoming-call",
      (data: { from: string; signal: any; callType: CallType }) => {
        setIsIncomingCall(true);
        setCallType(data.callType);
        setCallerInfo({
          id: data.from,
          name: data.from,
          signal: data.signal,
        });
      }
    );

    // Handle call accepted
    socket.on("call-accepted", (data: { signal: any }) => {
      
      if (peerRef.current) {
        
        peerRef.current.signal(data.signal);
      } else {
        
      }
    });

    // Handle call rejected
    socket.on("call-rejected", () => {
      
      endCall();
    });

    // Handle call ended
    socket.on("call-ended", () => {
      
      endCall();
    });

    // Handle ICE candidates
    socket.on("ice-candidate", (data: { candidate: any }) => {
      if (peerRef.current) {
        peerRef.current.signal(data.candidate);
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("ice-candidate");
    };
  }, [socket, userId]);

  const startCall = useCallback(
    async (receiverId: string, type: CallType) => {
      if (!socket || !userId) {
        return;
      }

      try {
        setCallType(type);
        otherUserIdRef.current = receiverId;

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          
          alert(
            "Your browser does not support audio/video calls. Please use a modern browser like Chrome, Firefox, or Safari."
          );
          return;
        }

        

        // Mobile-friendly media constraints
        const constraints: MediaStreamConstraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video:
            type === "video"
              ? {
                  width: { ideal: 640, max: 1280 },
                  height: { ideal: 480, max: 720 },
                  facingMode: "user", // Front camera on mobile
                }
              : false,
        };

        // Get media stream
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Create peer connection (initiator)
        const peer = new Peer({
          initiator: true,
          trickle: true,
          stream: stream,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
          },
        });

        peer.on("signal", (signal) => {
          // Only send the initial call signal, not ICE candidates
          if (!hasInitiatedCallRef.current) {
            hasInitiatedCallRef.current = true;
            socket.emit("call-user", {
              to: receiverId,
              from: userId,
              signal,
              callType: type,
            });
          }
        });

        peer.on("stream", (stream) => {
          remoteStreamRef.current = stream;
          setRemoteStream(stream);
        });

        peer.on("error", (err) => {
          
          cleanup();
        });

        peer.on("connect", () => {
          
        });

        peer.on("close", () => {
          
        });

        peerRef.current = peer;
        setIsCallActive(true);
        
      } catch (error: any) {
        

        // More specific error messages
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          alert(
            "Camera/microphone access denied. Please grant permissions in your browser settings and try again."
          );
        } else if (
          error.name === "NotFoundError" ||
          error.name === "DevicesNotFoundError"
        ) {
          alert(
            "No camera/microphone found. Please check your device and try again."
          );
        } else if (
          error.name === "NotReadableError" ||
          error.name === "TrackStartError"
        ) {
          alert("Camera/microphone is already in use by another application.");
        } else if (error.name === "OverconstrainedError") {
          alert("Camera/microphone does not meet the requirements.");
        } else {
          alert(`Could not start call: ${error.message || "Unknown error"}`);
        }

        cleanup();
      }
    },
    [socket, userId]
  );

  const cleanup = useCallback(() => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    // Destroy peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setIsIncomingCall(false);
    setCallType(null);
    setCallerInfo(null);
    otherUserIdRef.current = null;
    hasInitiatedCallRef.current = false; // Reset call initiation flag
  }, []);

  const acceptCall = useCallback(async () => {
    if (!socket || !userId || !callerInfo) {
      return;
    }

    try {
      otherUserIdRef.current = callerInfo.id;

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        
        alert(
          "Your browser does not support audio/video calls. Please use a modern browser like Chrome, Firefox, or Safari."
        );
        rejectCall();
        return;
      }

      

      // Mobile-friendly media constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video:
          callType === "video"
            ? {
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 },
                facingMode: "user", // Front camera on mobile
              }
            : false,
      };

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      localStreamRef.current = stream;
      setLocalStream(stream);

      // Create peer connection (not initiator)
      const peer = new Peer({
        initiator: false,
        trickle: true,
        stream: stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      peer.on("signal", (signal) => {
        
        socket.emit("accept-call", {
          to: callerInfo.id,
          signal,
        });
        
      });

      peer.on("stream", (stream) => {
        
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
      });

      peer.on("error", (err) => {
        
        cleanup();
      });

      peer.on("connect", () => {
        
      });

      peer.on("close", () => {
        
      });

      // Signal the caller
      
      peer.signal(callerInfo.signal);

      peerRef.current = peer;
      setIsCallActive(true);
      setIsIncomingCall(false);
      setCallerInfo(null);
    } catch (error: any) {
      

      // More specific error messages
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        alert(
          "Camera/microphone access denied. Please grant permissions in your browser settings and try again."
        );
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        alert(
          "No camera/microphone found. Please check your device and try again."
        );
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        alert("Camera/microphone is already in use by another application.");
      } else if (error.name === "OverconstrainedError") {
        alert("Camera/microphone does not meet the requirements.");
      } else {
        alert(`Could not accept call: ${error.message || "Unknown error"}`);
      }

      // Reject the call
      if (socket && callerInfo) {
        socket.emit("reject-call", { to: callerInfo.id });
      }
      cleanup();
    }
  }, [socket, userId, callerInfo, callType, cleanup]);

  const rejectCall = useCallback(() => {
    if (!socket || !callerInfo) return;

    socket.emit("reject-call", {
      to: callerInfo.id,
    });

    setIsIncomingCall(false);
    setCallerInfo(null);
    setCallType(null);
  }, [socket, callerInfo]);

  const endCall = useCallback(() => {
    

    // Notify the other user
    if (socket && otherUserIdRef.current) {
      socket.emit("end-call", {
        to: otherUserIdRef.current,
      });
    }

    cleanup();
  }, [socket, cleanup]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }, []);

  return {
    isCallActive,
    isIncomingCall,
    callType,
    callerInfo,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };
}
