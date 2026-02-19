#!/usr/bin/env node
/**
 * Test script for /api/transcribe endpoint.
 * Creates a minimal WAV file (short silence) and POSTs to the transcribe API.
 * Run with: node scripts/test-transcribe.mjs (dev server must be running)
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const API_URL = process.env.TRANSCRIBE_URL || "http://localhost:3000/api/transcribe";

// Minimal valid WAV: 44-byte header + a few samples (very short silence)
function createMinimalWav() {
  const sampleRate = 44100;
  const numChannels = 1;
  const bytesPerSample = 2;
  const durationSec = 0.1; // 100ms
  const numSamples = Math.floor(sampleRate * durationSec * numChannels);
  const dataSize = numSamples * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  // RIFF header
  buffer.write("RIFF", offset); offset += 4;
  buffer.writeUInt32LE(36 + dataSize, offset); offset += 4;
  buffer.write("WAVE", offset); offset += 4;
  // fmt chunk
  buffer.write("fmt ", offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4; // chunk size
  buffer.writeUInt16LE(1, offset); offset += 2;  // PCM
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, offset); offset += 4;
  buffer.writeUInt16LE(numChannels * bytesPerSample, offset); offset += 2;
  buffer.writeUInt16LE(8 * bytesPerSample, offset); offset += 2;
  // data chunk
  buffer.write("data", offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;
  // silence (zeros)
  return buffer;
}

async function testTranscribe() {
  console.log("Testing /api/transcribe...");
  console.log("URL:", API_URL);

  const wavBuffer = createMinimalWav();
  const blob = new Blob([wavBuffer], { type: "audio/wav" });
  const formData = new FormData();
  formData.append("file", blob, "test-silence.wav");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (res.ok) {
      console.log("✓ Transcribe succeeded");
      console.log("  Transcript:", data.transcript || "(empty - expected for silence)");
    } else {
      console.log("✗ Transcribe failed:", res.status, data.error || data);
    }
  } catch (err) {
    console.error("✗ Request failed:", err.message);
    console.error("  Make sure the dev server is running (npm run dev)");
  }
}

testTranscribe();
