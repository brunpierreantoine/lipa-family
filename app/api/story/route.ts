import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type StoryStyle = "Cozy" | "Funny" | "Adventure" | "Magical" | "Sci-Fi";
type StoryLength = "Short" | "Medium" | "Long";

function lengthToTargetWords(length: StoryLength) {
  if (length === "Short") return 250;
  if (length === "Medium") return 450;
  return 700;
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const kidName = String(body.kidName ?? "").trim();
    const age = String(body.age ?? "").trim();
    const style = String(body.style ?? "Cozy") as StoryStyle;
    const length = String(body.length ?? "Short") as StoryLength;
    const keywordsRaw = String(body.keywords ?? "");

    const keywords = keywordsRaw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 10);

    const targetWords = lengthToTargetWords(length);

    const prompt = `
Write a bedtime story for a child.

Child:
- Name: ${kidName || "the child"}
- Age: ${age || "young"}

Story requirements:
- Style: ${style}
- Approx length: ${targetWords} words
- Include these keywords naturally (if provided): ${keywords.length ? keywords.join(", ") : "none"}

Safety + format constraints:
- Text only (no markdown headings).
- Warm, playful, reassuring.
- No scary violence, no gore, no romance, no adult themes.
- Keep vocabulary appropriate for the age.
- End with a gentle, sleepy ending.
Return ONLY the story text.
`.trim();

    const result = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const story = result.output_text?.trim();
    if (!story) {
      return NextResponse.json(
        { error: "No story returned by the model." },
        { status: 500 }
      );
    }

    return NextResponse.json({ story });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}