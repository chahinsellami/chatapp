"use client";

/**
 * Custom React hook for managing WebRTC peer-to-peer voice and video calls
 * Uses Socket.IO for signaling and Simple-Peer for WebRTC connections
 * Handles call initiation, acceptance, rejection, and media stream management
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import Peer from "simple-peer";

/**
 * Type definition for call types supported by the application
 */
export type CallType = "voice" | "video";

/**
 * Props interface for the useWebRTC hook
 */
interface UseWebRTCProps {
  socket: Socket | null; // Socket.IO connection for signaling
  userId: string | null; // Current user's ID
}

/**
 * Custom hook for WebRTC peer-to-peer communication
 * Manages the complete lifecycle of voice and video calls
 * @param props - Socket connection and user ID
 * @returns Object containing call state and control methods
 */
export function useWebRTC({ socket, userId }: UseWebRTCProps) {
  // Call state management
  const [isCallActive, setIsCallActive] = useState(false); // Whether a call is currently active
  const [isIncomingCall, setIsIncomingCall] = useState(false); // Whether there's an incoming call waiting
  const [callType, setCallType] = useState<CallType | null>(null); // Type of current/pending call
  const [callerInfo, setCallerInfo] = useState<{
    // Information about incoming call caller
    id: string;
    name: string;
    signal: any;
  } | null>(null);

  // WebRTC connection references
  const peerRef = useRef<Peer.Instance | null>(null); // Simple-Peer instance for WebRTC
  const localStreamRef = useRef<MediaStream | null>(null); // Local user's media stream
  const remoteStreamRef = useRef<MediaStream | null>(null); // Remote user's media stream

  // React state for media streams (for UI updates)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null); // Local video/audio stream
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null); // Remote video/audio stream

  // Call tracking references
  const otherUserIdRef = useRef<string | null>(null); // ID of the other participant
  const hasInitiatedCallRef = useRef(false); // Prevents duplicate call signals

  useEffect(() => {
    // Only set up call listeners if socket and user are available
    if (!socket || !userId) return;

    console.log("🔌 Setting up WebRTC listeners for user:", userId);

    /**
     * Handle incoming call offers from other users
     * Sets up the incoming call state and caller information
     */
    socket.on(
      "incoming-call",
      (data: { from: string; signal: any; callType: CallType }) => {
        console.log(
          "📞 Incoming call from:",
          data.from,
          "Type:",
          data.callType
        );
        setIsIncomingCall(true);
        setCallType(data.callType);
        setCallerInfo({
          id: data.from,
          name: data.from, // Could be enhanced to show actual username
          signal: data.signal,
        });
      }
    );

    /**
     * Handle when the other user accepts our call offer
     * Signals the WebRTC peer with the acceptance signal
     */
    socket.on("call-accepted", (data: { signal: any }) => {
      console.log("✅ Call accepted by remote peer");
      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    });

    /**
     * Handle when the other user rejects our call
     * Cleans up the call state
     */
    socket.on("call-rejected", () => {
      console.log("❌ Call rejected by remote peer");
      alert("Call was rejected");
      endCall();
    });

    /**
     * Handle when the other user ends the call
     * Cleans up the call state
     */
    socket.on("call-ended", () => {
      console.log("📵 Call ended by remote peer");
      endCall();
    });

    /**
     * Handle call failure notification from server
     */
    socket.on("call-failed", (data: { reason: string }) => {
      console.error("❌ Call failed:", data.reason);
      alert(`Call failed: ${data.reason}`);
      cleanup();
    });

    /**
     * Handle ICE candidates for WebRTC connection establishment
     * ICE candidates help establish the peer-to-peer connection
     */
    socket.on("ice-candidate", (data: { candidate: any }) => {
      console.log("🧊 Received ICE candidate");
      if (peerRef.current) {
        peerRef.current.signal(data.candidate);
      }
    });

    // Cleanup: remove all socket listeners when component unmounts
    return () => {
      console.log("🔌 Cleaning up WebRTC listeners");
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("call-failed");
      socket.off("ice-candidate");
    };
  }, [socket, userId]);

  /**
   * Initiates a voice or video call to another user
   * Sets up local media stream and creates WebRTC peer connection
   * @param receiverId - ID of the user to call
   * @param type - Type of call ("voice" or "video")
   */
  const startCall = useCallback(
    async (receiverId: string, type: CallType) => {
      if (!socket || !userId) {
        return;
      }

      try {
        // Set call parameters
        setCallType(type);
        otherUserIdRef.current = receiverId;

        // Check browser compatibility for WebRTC
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert(
            "Your browser does not support audio/video calls. Please use a modern browser like Chrome, Firefox, or Safari."
          );
          return;
        }

        // Define media constraints optimized for mobile and web
        const constraints: MediaStreamConstraints = {
          audio: {
            echoCancellation: true, // Reduces echo during calls
            noiseSuppression: true, // Filters background noise
            autoGainControl: true, // Adjusts volume automatically
          },
          video:
            type === "video"
              ? {
                  width: { ideal: 640, max: 1280 }, // HD quality, adaptable
                  height: { ideal: 480, max: 720 },
                  facingMode: "user", // Front camera on mobile devices
                }
              : false, // No video for voice calls
        };

        // Request access to user's camera/microphone
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Store and set local media stream
        localStreamRef.current = stream;
        setLocalStream(stream);

        // Create WebRTC peer connection as the call initiator
        const peer = new Peer({
          initiator: true, // This peer initiates the connection
          trickle: true, // Send ICE candidates as they're discovered
          stream: stream, // Attach local media stream
          config: {
            iceServers: [
              // STUN servers help discover your public IP address
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:stun2.l.google.com:19302" },
              { urls: "stun:stun3.l.google.com:19302" },
              { urls: "stun:stun4.l.google.com:19302" },
              // Multiple TURN servers for better reliability
              {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              {
                urls: "turn:openrelay.metered.ca:443?transport=tcp",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              // Additional reliable STUN/TURN servers
              { urls: "stun:global.stun.twilio.com:3478" },
              {
                urls: "turn:global.turn.twilio.com:3478?transport=tcp",
                username:
                  "f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d",
                credential: "w1uxM55V9yVoqyVFjt+mxDBV0F87AUCemaYVQGxsPLw=",
              },
            ],
            iceTransportPolicy: "all", // Use all available connection methods
          },
        });

        // Handle WebRTC signaling data
        peer.on("signal", (signal) => {
          // Only send the initial offer signal, not ICE candidates
          if (!hasInitiatedCallRef.current) {
            hasInitiatedCallRef.current = true;
            console.log("📤 Sending call offer to:", receiverId);
            socket.emit("call-user", {
              to: receiverId,
              from: userId,
              signal,
              callType: type,
            });
          }
        });

        // Handle receiving remote media stream
        peer.on("stream", (stream) => {
          console.log("✅ Received remote stream!");
          remoteStreamRef.current = stream;
          setRemoteStream(stream);
        });

        // Handle WebRTC connection errors
        peer.on("error", (err) => {
          console.error("❌ WebRTC Error:", err);
          alert(
            `Call connection error: ${
              err.message || "Connection failed"
            }. This may be due to network/firewall restrictions.`
          );
          cleanup();
        });

        // Handle successful peer connection
        peer.on("connect", () => {
          console.log("✅ WebRTC peer connected successfully!");
        });

        // Handle peer connection closure
        peer.on("close", () => {
          console.log("📞 WebRTC peer connection closed");
          cleanup();
        });

        // Store peer reference and update call state
        peerRef.current = peer;
        setIsCallActive(true);
      } catch (error: any) {
        // Handle various media access errors with user-friendly messages
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

  /**
   * Cleans up all WebRTC resources and resets call state
   * Stops media streams and destroys peer connections
   */
  const cleanup = useCallback(() => {
    // Stop all local media tracks to free camera/microphone
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Stop all remote media tracks
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    // Destroy WebRTC peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Reset all call state
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setIsIncomingCall(false);
    setCallType(null);
    setCallerInfo(null);
    otherUserIdRef.current = null;
    hasInitiatedCallRef.current = false; // Reset call initiation flag
  }, []);

  /**
   * Accepts an incoming call offer
   * Sets up local media stream and responds to the call offer
   */
  const acceptCall = useCallback(async () => {
    if (!socket || !userId || !callerInfo) {
      return;
    }

    try {
      // Store the caller's ID for later use
      otherUserIdRef.current = callerInfo.id;

      // Check browser compatibility
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(
          "Your browser does not support audio/video calls. Please use a modern browser like Chrome, Firefox, or Safari."
        );
        rejectCall();
        return;
      }

      // Define media constraints (same as startCall)
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
                facingMode: "user",
              }
            : false,
      };

      // Get local media access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Store and set local stream
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Create WebRTC peer as the receiver (not initiator)
      const peer = new Peer({
        initiator: false, // Responding to call, not initiating
        trickle: true,
        stream: stream,
        config: {
          iceServers: [
            // STUN servers help discover your public IP address
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
            // Multiple TURN servers for better reliability
            {
              urls: "turn:openrelay.metered.ca:80",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            {
              urls: "turn:openrelay.metered.ca:443",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            {
              urls: "turn:openrelay.metered.ca:443?transport=tcp",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            // Additional reliable STUN/TURN servers
            { urls: "stun:global.stun.twilio.com:3478" },
            {
              urls: "turn:global.turn.twilio.com:3478?transport=tcp",
              username:
                "f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d",
              credential: "w1uxM55V9yVoqyVFjt+mxDBV0F87AUCemaYVQGxsPLw=",
            },
          ],
          iceTransportPolicy: "all", // Use all available connection methods
        },
      });

      // Handle signaling for call acceptance
      peer.on("signal", (signal) => {
        console.log("📤 Sending call acceptance to:", callerInfo.id);
        socket.emit("accept-call", {
          to: callerInfo.id,
          signal,
        });
      });

      // Handle receiving caller's media stream
      peer.on("stream", (stream) => {
        console.log("✅ Received caller's stream!");
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
      });

      // Handle connection errors
      peer.on("error", (err) => {
        console.error("❌ WebRTC Error during call acceptance:", err);
        alert(
          `Call connection error: ${
            err.message || "Connection failed"
          }. This may be due to network/firewall restrictions.`
        );
        cleanup();
      });

      // Handle successful connection
      peer.on("connect", () => {
        console.log("✅ WebRTC peer connected successfully!");
      });

      // Handle connection closure
      peer.on("close", () => {
        console.log("📞 WebRTC peer connection closed");
        cleanup();
      });

      // Signal the incoming call offer to establish connection
      peer.signal(callerInfo.signal);

      // Update call state
      peerRef.current = peer;
      setIsCallActive(true);
      setIsIncomingCall(false);
      setCallerInfo(null);
    } catch (error: any) {
      // Handle media access errors (same as startCall)

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

      // Reject the call if media access fails
      if (socket && callerInfo) {
        socket.emit("reject-call", { to: callerInfo.id });
      }
      cleanup();
    }
  }, [socket, userId, callerInfo, callType, cleanup]);

  /**
   * Rejects an incoming call offer
   * Notifies the caller and resets incoming call state
   */
  const rejectCall = useCallback(() => {
    if (!socket || !callerInfo) return;

    // Notify caller that call was rejected
    socket.emit("reject-call", {
      to: callerInfo.id,
    });

    // Reset incoming call state
    setIsIncomingCall(false);
    setCallerInfo(null);
    setCallType(null);
  }, [socket, callerInfo]);

  /**
   * Ends an active call
   * Notifies the other participant and cleans up resources
   */
  const endCall = useCallback(() => {
    // Notify the other user that call is ending
    if (socket && otherUserIdRef.current) {
      socket.emit("end-call", {
        to: otherUserIdRef.current,
      });
    }

    cleanup();
  }, [socket, cleanup]);

  /**
   * Toggles microphone on/off during a call
   * @returns The new microphone state (true = enabled, false = muted)
   */
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled; // Toggle audio track
        return audioTrack.enabled;
      }
    }
    return false; // No audio track available
  }, []);

  /**
   * Toggles camera on/off during a video call
   * @returns The new camera state (true = enabled, false = disabled)
   */
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled; // Toggle video track
        return videoTrack.enabled;
      }
    }
    return false; // No video track available
  }, []);

  // Return hook interface with all state and methods
  return {
    isCallActive, // Whether a call is currently active
    isIncomingCall, // Whether there's an incoming call
    callType, // Type of current call ("voice" or "video")
    callerInfo, // Information about incoming call caller
    localStream, // Local user's media stream
    remoteStream, // Remote user's media stream
    startCall, // Function to initiate a call
    acceptCall, // Function to accept incoming call
    rejectCall, // Function to reject incoming call
    endCall, // Function to end current call
    toggleAudio, // Function to mute/unmute microphone
    toggleVideo, // Function to turn camera on/off
  };
}
