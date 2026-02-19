import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { toUserMessage, getErrorContextForLog } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const start = Date.now();
  try {
    logger.info("Transcribe request started", { operation: "transcribe", resource: "transcribe" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Transcription not configured. Add OPENAI_API_KEY to .env.local" },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["audio/webm", "audio/mp3", "audio/wav", "audio/mpeg", "audio/ogg", "audio/webm;codecs=opus", "audio/webm; codecs=opus", "audio/mpeg3"];
    const rawMime = file.type || "";
    const mimeType = rawMime.split(";")[0].trim();
    if (!allowedTypes.some((t) => t.startsWith(mimeType) || mimeType.startsWith("audio/"))) {
      return NextResponse.json(
        { error: `Unsupported file type: ${rawMime || "unknown"}. Use audio (webm, wav, mp3, ogg).` },
        { status: 400 }
      );
    }

    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    const whisperFormData = new FormData();
    whisperFormData.append("file", file, "recording.webm");
    whisperFormData.append("model", "whisper-1");
    whisperFormData.append("response_format", "json");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message ?? JSON.stringify(data);
      logger.error("Whisper transcribe failed", {
        operation: "transcribe",
        resource: "transcribe",
        status: response.status,
        message: errMsg,
        durationMs: Date.now() - start,
      });
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Check OPENAI_API_KEY in .env.local" },
          { status: 503 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: "API rate limit exceeded. Please wait a minute and try again." },
          { status: 429 }
        );
      }
      const devHint = process.env.NODE_ENV === "development" ? ` (${errMsg.slice(0, 120)})` : "";
      return NextResponse.json(
        { error: `Transcription failed. Please try again.${devHint}` },
        { status: response.status >= 500 ? 503 : 400 }
      );
    }

    const transcript = (data?.text ?? "").trim();
    logger.info("Transcribe request succeeded", {
      operation: "transcribe",
      resource: "transcribe",
      provider: "whisper",
      durationMs: Date.now() - start,
    });
    return NextResponse.json({ transcript });
  } catch (error) {
    logger.error("Transcribe request failed", {
      operation: "transcribe",
      resource: "transcribe",
      durationMs: Date.now() - start,
      error: getErrorContextForLog(error),
    });
    return NextResponse.json({ error: toUserMessage(error) }, { status: 500 });
  }
}
