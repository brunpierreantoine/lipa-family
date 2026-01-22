"use client";

import { useMemo, useState } from "react";

type StoryStyle = "Cozy" | "Funny" | "Adventure" | "Magical" | "Sci-Fi";
type StoryLength = "Short" | "Medium" | "Long";

function buildMockStory(params: {
  kidName: string;
  age: string;
  style: StoryStyle;
  length: StoryLength;
  keywords: string;
}) {
  const { kidName, age, style, length, keywords } = params;

  const cleanedName = kidName.trim() || "your kid";
  const cleanedAge = age.trim() || "a young";
  const cleanedKeywords = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 8);

  const kw = cleanedKeywords.length ? cleanedKeywords.join(", ") : "a surprise twist";
  const lengthHint =
    length === "Short" ? "a short" : length === "Medium" ? "a medium-length" : "a longer";

  return `Tonight’s story is ${lengthHint}, ${style.toLowerCase()} tale for ${cleanedName} (${cleanedAge} years old).

Once upon a time, ${cleanedName} discovered ${kw}. It didn’t make sense at first… but that’s how the best adventures begin.

(Next: we’ll replace this mock story with a real AI-generated one.)`;
}

export default function Home() {
  const [kidName, setKidName] = useState("");
  const [age, setAge] = useState("");
  const [style, setStyle] = useState<StoryStyle>("Cozy");
  const [length, setLength] = useState<StoryLength>("Short");
  const [keywords, setKeywords] = useState("");
  const [story, setStory] = useState("");

  const canGenerate = useMemo(() => {
    return kidName.trim().length > 0 || age.trim().length > 0 || keywords.trim().length > 0;
  }, [kidName, age, keywords]);

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Kids Story Generator</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Enter a few details, click Generate, and get a bedtime story.
      </p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginTop: 18 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Kid name
          <input
            value={kidName}
            onChange={(e) => setKidName(e.target.value)}
            placeholder="e.g., Leo"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Age
          <input
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g., 5"
            inputMode="numeric"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Style
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as StoryStyle)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          >
            <option>Cozy</option>
            <option>Funny</option>
            <option>Adventure</option>
            <option>Magical</option>
            <option>Sci-Fi</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Length
          <select
            value={length}
            onChange={(e) => setLength(e.target.value as StoryLength)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          >
            <option>Short</option>
            <option>Medium</option>
            <option>Long</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
          Keywords (comma-separated)
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="dragon, moon, cookie, spaceship…"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <button
          onClick={() => setStory(buildMockStory({ kidName, age, style, length, keywords }))}
          disabled={!canGenerate}
          style={{
            gridColumn: "1 / -1",
            padding: 12,
            borderRadius: 12,
            border: "none",
            cursor: canGenerate ? "pointer" : "not-allowed",
            fontSize: 16,
            opacity: canGenerate ? 1 : 0.5,
          }}
        >
          Generate story
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Story output
          <textarea
            value={story}
            readOnly
            placeholder="Your story will appear here…"
            rows={10}
            style={{ padding: 12, borderRadius: 12, border: "1px solid #ccc", width: "100%" }}
          />
        </label>
      </div>
    </main>
  );
}