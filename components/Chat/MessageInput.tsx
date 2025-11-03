"use client";

import { useState } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSend(text);
      setText("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      {/* Input area with depth */}
      <div className="flex-1 bg-[#40444B] rounded-lg border border-[#202225] focus-within:border-[#5B65F5] focus-within:shadow-lg transition smooth overflow-hidden">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message #channel..."
          className="w-full px-4 py-3 bg-[#40444B] text-[#DCDDDE] placeholder-[#72767D] outline-none resize-none max-h-32 smooth text-sm"
          rows={1}
          style={{ minHeight: "44px" }}
          disabled={isSending}
        />
      </div>

      {/* Send button with enhanced styling */}
      <button
        type="submit"
        disabled={!text.trim() || isSending}
        className="p-3 bg-[#5B65F5] hover:bg-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition smooth flex items-center justify-center font-semibold"
        title="Send message (Enter)"
      >
        {isSending ? (
          <span className="animate-spin text-lg">⟳</span>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.40,22.99 3.50612381,23.1 4.13399899,22.9429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4380088 C3.03521743,10.5951061 3.19218622,10.7522035 3.50612381,10.7522035 L16.6915026,11.5376905 C16.6915026,11.5376905 17.1624089,11.5376905 17.1624089,12.0089827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
          </svg>
        )}
      </button>
    </form>
  );
}
