"use client";

import React, { useRef, useState } from "react";
import { useWebSocket } from "@/lib/useWebSocket";

interface FileSharePanelProps {
  userId: string;
  recipientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FileSharePanel: React.FC<FileSharePanelProps> = ({
  userId,
  recipientId,
  isOpen,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const { shareFile } = useWebSocket({ userId });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const fileData = {
        id: data.file.id,
        name: data.file.name,
        size: data.file.size,
        type: data.file.type,
        url: data.file.url,
        uploadedAt: data.file.uploadedAt,
      };

      // Share file via WebSocket
      shareFile(recipientId, fileData);

      // Add to local list
      setSharedFiles((prev) => [fileData, ...prev]);

      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Share File</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-semibold transition"
        >
          {uploading ? "Uploading..." : "Select File"}
        </button>

        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">{uploadProgress}%</p>
          </div>
        )}

        {sharedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Shared Files:
            </h3>
            <div className="space-y-2">
              {sharedFiles.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  download={file.name}
                  className="block p-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-blue-400 hover:text-blue-300 truncate transition"
                  title={file.name}
                >
                  📄 {file.name} ({formatFileSize(file.size)})
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
