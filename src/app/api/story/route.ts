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
    const familyProfile = String(body.familyProfile ?? "").trim();

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

FAMILY PROFILE (USER-EDITABLE):
${familyProfile || "Not provided."}

USER INPUTS:
- Style: ${style}
- Length: about ${minutes} minutes (~${targetWords} words)
- Moral / lesson to teach: ${moral || "a gentle positive lesson (kindness, sharing, courage, gratitude)"
      }
- Keywords to include naturally (if provided): ${keywords.length ? keywords.join(", ") : "none"
      }

STRUCTURE:
- Provide a title in French on the first line.
- Use a number of chapters adapted to the length:
  - 3 minutes → 2 to 3 short chapters
  - 5 minutes → 3 to 4 chapters
  - 10 minutes → 5 to 6 chapters
- Each chapter must start with a heading like: "Chapitre 1 — ..."
- Chapters should be short, vivid, and easy to read aloud.
- End with a calm, reassuring bedtime ending.

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}