"use client";

/**
 * WebRTC Diagnostics Component
 * Tests WebRTC capabilities, STUN/TURN servers, and connection status
 * Helps debug voice/video call issues
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Loader } from "lucide-react";

interface DiagnosticResult {
  test: string;
  status: "pending" | "success" | "error" | "warning";
  message: string;
}

export default function WebRTCDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults((prev) => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setTesting(true);

    // Test 1: Browser Support
    addResult({
      test: "Browser WebRTC Support",
      status: "pending",
      message: "Checking browser compatibility...",
    });

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setResults((prev) =>
        prev.map((r) =>
          r.test === "Browser WebRTC Support"
            ? {
                ...r,
                status: "error",
                message:
                  "❌ Browser does not support WebRTC. Please use Chrome, Firefox, or Safari.",
              }
            : r
        )
      );
      setTesting(false);
      return;
    } else {
      setResults((prev) =>
        prev.map((r) =>
          r.test === "Browser WebRTC Support"
            ? {
                ...r,
                status: "success",
                message: "✅ Browser supports WebRTC",
              }
            : r
        )
      );
    }

    // Test 2: Media Devices
    addResult({
      test: "Media Devices",
      status: "pending",
      message: "Checking for camera and microphone...",
    });

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudio = devices.some((d) => d.kind === "audioinput");
      const hasVideo = devices.some((d) => d.kind === "videoinput");

      if (hasAudio && hasVideo) {
        setResults((prev) =>
          prev.map((r) =>
            r.test === "Media Devices"
              ? {
                  ...r,
                  status: "success",
                  message: `✅ Found ${
                    devices.filter((d) => d.kind === "audioinput").length
                  } microphone(s) and ${
                    devices.filter((d) => d.kind === "videoinput").length
                  } camera(s)`,
                }
              : r
          )
        );
      } else if (hasAudio) {
        setResults((prev) =>
          prev.map((r) =>
            r.test === "Media Devices"
              ? {
                  ...r,
                  status: "warning",
                  message:
                    "⚠️ Microphone found but no camera (voice calls only)",
                }
              : r
          )
        );
      } else {
        setResults((prev) =>
          prev.map((r) =>
            r.test === "Media Devices"
              ? {
                  ...r,
                  status: "error",
                  message: "❌ No microphone or camera found",
                }
              : r
          )
        );
      }
    } catch (err: any) {
      setResults((prev) =>
        prev.map((r) =>
          r.test === "Media Devices"
            ? {
                ...r,
                status: "error",
                message: `❌ Error checking devices: ${err.message}`,
              }
            : r
        )
      );
    }

    // Test 3: Media Permissions
    addResult({
      test: "Media Permissions",
      status: "pending",
      message: "Testing microphone access...",
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      // Stop the stream immediately
      stream.getTracks().forEach((track) => track.stop());

      setResults((prev) =>
        prev.map((r) =>
          r.test === "Media Permissions"
            ? {
                ...r,
                status: "success",
                message: "✅ Microphone permission granted",
              }
            : r
        )
      );
    } catch (err: any) {
      setResults((prev) =>
        prev.map((r) =>
          r.test === "Media Permissions"
            ? {
                ...r,
                status: "error",
                message: `❌ Microphone permission denied: ${err.name}`,
              }
            : r
        )
      );
    }

    // Test 4: STUN Server Connectivity
    addResult({
      test: "STUN Server",
      status: "pending",
      message: "Testing STUN server connectivity...",
    });

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Create a dummy data channel to trigger ICE gathering
      pc.createDataChannel("test");

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE candidate
      const iceCandidate = await new Promise<RTCIceCandidate | null>(
        (resolve) => {
          const timeout = setTimeout(() => resolve(null), 5000);
          pc.onicecandidate = (e) => {
            if (e.candidate) {
              clearTimeout(timeout);
              resolve(e.candidate);
            }
          };
        }
      );

      pc.close();

      if (iceCandidate) {
        setResults((prev) =>
          prev.map((r) =>
            r.test === "STUN Server"
              ? {
                  ...r,
                  status: "success",
                  message: `✅ STUN server reachable (${
                    iceCandidate.address || "ICE candidate found"
                  })`,
                }
              : r
          )
        );
      } else {
        setResults((prev) =>
          prev.map((r) =>
            r.test === "STUN Server"
              ? {
                  ...r,
                  status: "warning",
                  message: "⚠️ STUN server timeout - may affect call quality",
                }
              : r
          )
        );
      }
    } catch (err: any) {
      setResults((prev) =>
        prev.map((r) =>
          r.test === "STUN Server"
            ? {
                ...r,
                status: "error",
                message: `❌ STUN server test failed: ${err.message}`,
              }
            : r
        )
      );
    }

    // Test 5: Network Type
    addResult({
      test: "Network Information",
      status: "success",
      message: `📡 Connection type: ${
        (navigator as any).connection?.effectiveType || "Unknown"
      }`,
    });

    setTesting(false);
  };

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "pending":
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  return (
    <div className="p-6 glass-card">
      <h2 className="text-xl font-bold text-white mb-4">WebRTC Diagnostics</h2>
      <p className="text-slate-300 text-sm mb-6">
        Run this test if voice/video calls aren't working. This will check your
        browser, devices, permissions, and network connectivity.
      </p>

      <motion.button
        onClick={runDiagnostics}
        disabled={testing}
        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {testing ? "Running Tests..." : "Run Diagnostics"}
      </motion.button>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(result.status)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm mb-1">
                  {result.test}
                </h3>
                <p className="text-slate-300 text-sm">{result.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!testing && results.length > 0 && (
        <div className="mt-6 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <h3 className="font-semibold text-white text-sm mb-2">
            💡 Troubleshooting Tips
          </h3>
          <ul className="text-slate-300 text-sm space-y-2">
            <li>
              • If permissions are denied, go to browser settings and enable
              camera/microphone access
            </li>
            <li>
              • If STUN server fails, you may be behind a strict
              firewall/corporate network
            </li>
            <li>
              • For best results, ensure both users are on stable internet
              connections
            </li>
            <li>
              • Calls may not work between different networks without proper
              TURN servers
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
