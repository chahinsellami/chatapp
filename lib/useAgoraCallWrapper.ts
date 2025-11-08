"use client";

import { useState, useEffect } from "react";

// Wrapper to lazy-load Agora only when needed
export function useAgoraCallWrapper(userId: string) {
  const [agoraHook, setAgoraHook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only load Agora on client-side
    if (typeof window !== "undefined") {
      import("@/lib/useAgoraCall")
        .then((mod) => {
          const hook = mod.useAgoraCall(userId);
          setAgoraHook(hook);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load Agora:", err);
          setIsLoading(false);
        });
    }
  }, [userId]);

  // Return stub methods while loading
  if (isLoading || !agoraHook) {
    return {
      startCall: async () => {},
      endCall: async () => {},
      toggleAudio: async () => false,
      toggleVideo: async () => false,
      isCallActive: false,
      localAudioTrack: null,
      localVideoTrack: null,
      remoteUsers: [],
      isAudioEnabled: true,
      isVideoEnabled: true,
      currentChannel: null,
      callType: null,
    };
  }

  return agoraHook;
}
