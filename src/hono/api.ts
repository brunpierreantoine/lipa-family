import { Hono, type Context } from 'hono'
import { cors } from 'hono/cors'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getCookie, setCookie } from 'hono/cookie'
import OpenAI from "openai";
import { STORY_CONFIG } from "@/lib/storyConfig";

export const app = new Hono().basePath('/api')

app.use('*', cors())

const getSupabase = (c: Context) => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return getCookie(c, name)
                },
                set(name: string, value: string, options: CookieOptions) {
                    setCookie(c, name, value, options as CookieOptions & { sameSite?: "Strict" | "Lax" | "None" })
                },
                remove(name: string, options: CookieOptions) {
                    setCookie(c, name, '', options as CookieOptions & { sameSite?: "Strict" | "Lax" | "None" })
                },
            },
        }
    )
}

type StoryStyle = "Educatif" | "Amusant" | "Aventure" | "Magique";
type StoryUniverse = "Féerique" | "Futuriste / SF" | "Dinosaures" | "Animaux" | "Vie quotidienne";
type StoryMinutes = 3 | 5 | 10;

function coerceMinutes(value: unknown): StoryMinutes {
    const n = Number(value);
    if (n === 3 || n === 5 || n === 10) return n;
    return 5; // sensible default
}

function minutesToTargetWords(minutes: StoryMinutes) {
    if (minutes === 3) return 380;
    if (minutes === 5) return 650;
    return 1300;
}

app.post('/stories', async (c) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return c.json({ error: "Missing OPENAI_API_KEY" }, 500);
        }

        const supabase = getSupabase(c);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const minutes = coerceMinutes(body.minutes);
        const style = String(body.style ?? "Amusant") as StoryStyle;
        const universe = String(body.universe ?? "Féerique") as StoryUniverse;
        const moral = String(body.moral ?? "").trim();
        const keywordsRaw = String(body.keywords ?? "");

        const { data: memberships } = await supabase
            .from("memberships")
            .select("families(ai_profile)")
            .eq("user_id", user.id)
            .limit(1);

        if (!memberships || memberships.length === 0) {
            return c.json({ error: "No family found for user" }, 404);
        }

        const familyData = Array.isArray(memberships[0].families) ? memberships[0].families[0] : memberships[0].families;
        const familyProfile = String(familyData?.ai_profile ?? "").trim();

        const keywords = keywordsRaw
            .split(",")
            .map((k: string) => k.trim())
            .filter(Boolean)
            .slice(0, 10);

        const targetWords = minutesToTargetWords(minutes);

        const prompt = `
You are an expert children's book author specializing in engaging, modern, and gentle bedtime stories.

FAMILY AND CONTEXT:
${STORY_CONFIG.familyContext}

FAMILY PROFILE:
${familyProfile || "Not provided (use a general friendly family tone)."}

STORY INSTRUCTIONS:
- LANGUAGE: The entire story MUST be written in French.
- PRIORITY: Favor fluency, natural flow, and fast generation over perfection. 
  Do not over-polish sentences; write smoothly and confidently.
- TONE: Natural, warm, and lively French. Adapt the complexity and vocabulary based on the ages and details provided in the FAMILY PROFILE. Speak to children as adults-in-the-making: use clear but rich language.
- VERB TENSE (STRICT): Never use "passé simple" (e.g., "il marcha", "ils virent", "elle répondit").
  Use PRESENT TENSE by default, or PASSÉ COMPOSÉ when appropriate.
- Avoid archaic or overly literary phrases. The flow should be smooth and engaging.

FAMILY ROLE NAMING:
- Parents MUST be referred to as "papa" and "maman".
- Children are referred to by their first names.
- Extended family should use natural French terms:
  - "mamie", "papi", "tata [Prénom]", "tonton [Prénom]", etc.
- Do not use adult first names for parents unless explicitly requested.

AUTHORIAL VOICE (CHILDREN'S LITERATURE):
- Write as a modern French children's author.
- Use short to medium sentences with a natural read-aloud rhythm.
- Occasional gentle repetition is welcome.
- Prefer concrete images over abstract explanations.
- Let lessons emerge naturally without explicit moralizing.
- The narrator should feel close, warm, and reassuring.

STYLE REFERENCE:
- Simple, warm language suitable for bedtime reading.
- Gentle emotions and soft humor.
- Prefer playful situations and phrasing over explaining that something is funny.

STORY PARAMETERS:
- Universe: ${universe}
- Style: ${style}
- Duration: approximately ${minutes} minutes (~${targetWords} words)
- Theme / Moral: ${moral || "a gentle positive lesson (kindness, sharing, courage, curiosity)"}
- Keywords to include: ${keywords.length ? keywords.join(", ") : "none"}

STRUCTURE:
- Provide an engaging Title at the top.
- Divide the story into clearly labeled chapters (e.g., "Chapitre 1 — ...").
- Ensure the number of chapters matches the duration:
  - 3 min -> 2-3 chapters
  - 5 min -> 3-4 chapters
  - 10 min -> 5-6 chapters
- End with a calm, reassuring bedtime conclusion.

SAFETY RULES:
${STORY_CONFIG.safetyRules}

FORMAT:
- Plain text only.
- No Markdown symbols.
- Title on the first line, then a line break.
- Chapters identified by "Chapitre X — [Title]".
- Return ONLY the story text.
`.trim();

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        try {
            const completionStream = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                stream: true,
            });

            const encoder = new TextEncoder();
            const stream = new ReadableStream<Uint8Array>({
                async start(controller) {
                    try {
                        for await (const chunk of completionStream) {
                            const delta = chunk.choices?.[0]?.delta?.content ?? "";
                            if (!delta) continue;
                            controller.enqueue(encoder.encode(delta));
                        }
                        controller.close();
                    } catch (streamErr) {
                        controller.error(streamErr);
                    }
                },
            });

            return new Response(stream, {
                status: 200,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "Cache-Control": "no-store",
                },
            });
        } catch {
            // Graceful fallback to the previous non-streaming behavior.
            const result = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
            });

            const story = result.choices[0]?.message?.content?.trim();
            if (!story) {
                return c.json({ error: "No story returned by the model." }, 500);
            }

            return c.json({ story });
        }
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return c.json({ error: errorMessage }, 500);
    }
})

export default app
