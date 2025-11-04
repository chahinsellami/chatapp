"use client";

import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
}

export default function AudioPlayer({ audioUrl, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 bg-[#2F3136] rounded-lg p-2 max-w-xs">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Play/Pause button */}
      <button
        onClick={togglePlayPause}
        className="w-8 h-8 flex items-center justify-center bg-[#5B65F5] hover:bg-[#4752C4] rounded-full transition flex-shrink-0"
        title={isPlaying ? "Pause" : "Play"}
      >
        <span className="text-white text-sm">{isPlaying ? "⏸️" : "▶️"}</span>
      </button>

      {/* Waveform / Progress bar */}
      <div className="flex-1 flex flex-col gap-1">
        <input
          type="range"
          min="0"
          max={audioDuration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-[#40444B] rounded-full appearance-none cursor-pointer voice-slider"
          style={{
            background: `linear-gradient(to right, #5B65F5 0%, #5B65F5 ${(currentTime / audioDuration) * 100}%, #40444B ${(currentTime / audioDuration) * 100}%, #40444B 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-[#72767D]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>

      {/* Microphone icon */}
      <div className="text-lg">🎙️</div>
    </div>
  );
}
