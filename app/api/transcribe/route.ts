import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Stub: wire to Whisper or another speech-to-text service when ready.
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["audio/webm", "audio/mp3", "audio/wav", "audio/mpeg", "audio/ogg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Supported types: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    // TODO: upload to temp storage, call Whisper/AssemblyAI, return transcript
    return NextResponse.json({ 
      transcript: "(transcription not configured)",
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error("Transcribe error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
