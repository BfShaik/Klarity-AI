"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export default function VoiceRecorder({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const chunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia &&
        typeof MediaRecorder !== "undefined" &&
        window.isSecureContext
    );
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError(
        window.isSecureContext
          ? "Voice recording is not supported in this browser."
          : "Voice recording requires HTTPS (or localhost)."
      );
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      mr.start(100);
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (err) {
      setError("Microphone access denied or unavailable.");
    }
  }, [isSupported]);

  const stopRecording = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return;
    setRecording(false);
    setProcessing(true);
    setError(null);
    const stream = streamRef.current;
    const blob = await new Promise<Blob>((resolve) => {
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mr.onstop = () => {
        if (stream) stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        resolve(new Blob(chunks, { type: mr.mimeType || "audio/webm" }));
      };
      mr.stop();
    });
    try {
      if (blob.size === 0) {
        setError("No audio recorded. Try speaking louder or check your microphone.");
        return;
      }
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.transcript) onTranscript(data.transcript);
      else if (data.error) setError(data.error);
      else setError("Transcription failed. Paste or type your note instead.");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out (API may be overloaded). Try again in a minute.");
      } else {
        setError("Transcription failed. Paste or type your note instead.");
      }
    } finally {
      setProcessing(false);
    }
  }, [onTranscript]);

  if (!isSupported) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-300">Voice note</p>
        <p className="text-sm text-slate-400">
          {typeof window !== "undefined" && !window.isSecureContext
            ? "Voice recording requires HTTPS (or use localhost)."
            : "Voice recording is not available in this browser."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-300">Voice note</p>
      <div className="flex items-center gap-2">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={processing}
            className="btn-primary disabled:opacity-50"
          >
            {processing ? "Processing…" : "Start recording"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="btn-secondary"
          >
            Stop & transcribe
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
