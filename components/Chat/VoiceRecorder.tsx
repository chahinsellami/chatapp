"use client";

import { useState, useRef, useEffect } from "react";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone");
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleSend = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      onSend(audioBlob);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#2F3136] border border-[#40444B] rounded-lg p-4 shadow-xl animate-slide-up">
      <div className="flex items-center gap-3">
        {isRecording ? (
          <>
            {/* Recording indicator */}
            <div className="flex items-center gap-2 flex-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-mono text-sm">
                {formatDuration(duration)}
              </span>
              <div className="flex-1 h-1 bg-[#40444B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5B65F5] animate-pulse"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>

            {/* Stop recording */}
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-[#5B65F5] hover:bg-[#4752C4] text-white rounded-lg font-bold transition"
              title="Stop recording"
            >
              ⏹️ Stop
            </button>
          </>
        ) : audioURL ? (
          <>
            {/* Playback */}
            <audio src={audioURL} controls className="flex-1 h-8" />
            
            {/* Send button */}
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
              title="Send voice message"
            >
              ✓ Send
            </button>
          </>
        ) : null}

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition"
          title="Cancel"
        >
          ✕
        </button>
      </div>

      <p className="text-xs text-[#72767D] mt-2 text-center">
        {isRecording ? "Recording... Click stop when done" : "Review your voice message"}
      </p>
    </div>
  );
}
