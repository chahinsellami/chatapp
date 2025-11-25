"use client";

import { useState, useEffect } from "react";

// Lazy-loaded Agora hook
let useAgoraCallModule: any = null;

// Wrapper to lazy-load Agora only when needed
export function useAgoraCallWrapper(userId: string) {
  const [hook, setHook] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only load Agora on client-side
    if (typeof window !== "undefined" && !useAgoraCallModule) {
      import("@/lib/useAgoraCall")
        .then((mod) => {
          useAgoraCallModule = mod.useAgoraCall;
          setIsLoaded(true);
        })
        .catch((err) => {
          // Failed to load Agora: (err)
        });
    } else if (useAgoraCallModule) {
      setIsLoaded(true);
    }
  }, []);

  // Only call the actual hook after the module is loaded
  const agoraHook =
    isLoaded && useAgoraCallModule ? useAgoraCallModule(userId) : null;

  // Return the actual hook if loaded, otherwise return stub
  if (!agoraHook) {
    return {
      startCall: async () => {
        // Agora not loaded yet
      },
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
