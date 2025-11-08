import { useEffect, useRef } from "react";
import { ICameraVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";

interface VideoPlayerProps {
  videoTrack: ICameraVideoTrack | IRemoteVideoTrack | null;
  isLocal?: boolean;
  className?: string;
}

/**
 * Component to render Agora video tracks
 * Automatically plays the video track when it's available
 */
export function VideoPlayer({ videoTrack, isLocal = false, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoTrack || !videoRef.current) return;

    // Play the video track in the div element
    videoTrack.play(videoRef.current);
    console.log(`📺 Playing ${isLocal ? "local" : "remote"} video`);

    return () => {
      // Stop playing when component unmounts
      videoTrack.stop();
      console.log(`⏹️ Stopped ${isLocal ? "local" : "remote"} video`);
    };
  }, [videoTrack, isLocal]);

  return (
    <div
      ref={videoRef}
      className={`${className} bg-neutral-900 rounded-lg overflow-hidden`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
