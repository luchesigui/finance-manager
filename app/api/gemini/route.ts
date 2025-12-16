import { NextResponse } from "next/server";

type GeminiRequestBody = {
  prompt: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  let body: GeminiRequestBody;
  try {
    body = (await request.json()) as GeminiRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.prompt || typeof body.prompt !== "string") {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: body.prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    return NextResponse.json({ error: `Gemini API error: ${response.status}` }, { status: 502 });
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Não foi possível gerar uma resposta.";

  return NextResponse.json({ text });
}
