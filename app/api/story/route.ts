import { NextResponse } from "next/server";
import OpenAI from "openai";
import { STORY_CONFIG } from "@/lib/storyConfig";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type StoryStyle = "Cozy" | "Funny" | "Adventure" | "Magical" | "Sci-Fi";
type StoryMinutes = 3 | 5 | 10;

function coerceMinutes(value: unknown): StoryMinutes {
  const n = Number(value);
  if (n === 3 || n === 5 || n === 10) return n;
  return 5; // sensible default
}

function minutesToTargetWords(minutes: StoryMinutes) {
  // Rough rule: bedtime reading pace ~130–160 wpm; target a bit lower for younger kids
  if (minutes === 3) return 380;
  if (minutes === 5) return 650;
  return 1300;
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

    const minutes = coerceMinutes(body.minutes);
    const style = String(body.style ?? "Cozy") as StoryStyle;
    const moral = String(body.moral ?? "").trim();
    const keywordsRaw = String(body.keywords ?? "");

    const keywords = keywordsRaw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 10);

    const targetWords = minutesToTargetWords(minutes);

    const prompt = `
You are a creative bedtime-story writer.

LANGUAGE:
- Write the entire story in French.

AUDIENCE & CONTEXT:
${STORY_CONFIG.familyContext}

USER INPUTS:
- Style: ${style}
- Length: about ${minutes} minutes (~${targetWords} words)
- Moral / lesson to teach: ${
      moral || "a gentle positive lesson (kindness, sharing, courage, gratitude)"
    }
- Keywords to include naturally (if provided): ${
      keywords.length ? keywords.join(", ") : "none"
    }

STRUCTURE:
- Provide a title in French on the first line.
- Then split into 3 to 6 short chapters with headings like: "Chapitre 1 — ..."
- Keep chapters short, vivid, and easy to read aloud.
- End with a calm “bonne nuit” feeling.

SAFETY RULES:
${STORY_CONFIG.safetyRules}

FORMAT:
- Text only.
- Return ONLY the story text (no extra commentary).
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