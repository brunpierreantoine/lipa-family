"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DEFAULT_FAMILY_PROFILE, SETTINGS_STORAGE_KEY, THEME_STORAGE_KEY } from "@/lib/storyDefaults";

type StoryStyle = "Cozy" | "Funny" | "Adventure" | "Magical" | "Sci-Fi";
type StoryMinutes = 3 | 5 | 10;

function parseStory(raw: string) {
  const text = (raw || "").trim();
  if (!text) return null;

  const lines = text.split("\n");
  const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);

  const title = nonEmpty[0] ?? "Une histoire du soir";

  const chapters: { heading: string; paragraphs: string[] }[] = [];

  let currentHeading = "";
  let currentBody: string[] = [];

  // Anything written before the first "Chapitre X" goes here
  const introLines: string[] = [];

  function bodyToParagraphs(bodyLines: string[]) {
    const joined = bodyLines.join("\n").trim();
    if (!joined) return [];
    return joined
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  function pushCurrent() {
    const paragraphs = bodyToParagraphs(currentBody);
    if (!currentHeading || paragraphs.length === 0) return;
    chapters.push({ heading: currentHeading, paragraphs });
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (!currentHeading) introLines.push("");
      else currentBody.push("");
      continue;
    }

    if (/^chapitre\s+\d+/i.test(line)) {
      pushCurrent();
      currentHeading = line;
      currentBody = [];
      continue;
    }

    if (!currentHeading) introLines.push(line);
    else currentBody.push(line);
  }

  pushCurrent();

  if (chapters.length > 0) {
    const introParagraphs = bodyToParagraphs(introLines);
    if (introParagraphs.length > 0) {
      chapters[0] = {
        ...chapters[0],
        paragraphs: [...introParagraphs, ...chapters[0].paragraphs],
      };
    }
    return { title, chapters };
  }

  const body = nonEmpty.slice(1).join("\n\n").trim();
  return {
    title,
    chapters: [
      {
        heading: "Histoire",
        paragraphs: body ? body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : [],
      },
    ],
  };
}

export default function StoryPage() {
  const [minutes, setMinutes] = useState<StoryMinutes>(5);
  const [style, setStyle] = useState<StoryStyle>("Cozy");
  const [keywords, setKeywords] = useState("");
  const [moral, setMoral] = useState("");

  const [familyProfile] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SETTINGS_STORAGE_KEY) || DEFAULT_FAMILY_PROFILE;
    }
    return DEFAULT_FAMILY_PROFILE;
  });

  const [rawStory, setRawStory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Apply theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const story = useMemo(() => {
    if (isLoading) return null;
    return parseStory(rawStory);
  }, [rawStory, isLoading]);

  const canGenerate = useMemo(() => {
    return keywords.trim().length > 0 || moral.trim().length > 0;
  }, [keywords, moral]);

  async function generateStory() {
    setIsLoading(true);
    setRawStory("Je fabrique l’histoire… ✨");

    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes, style, keywords, moral, familyProfile }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        setRawStory(
          `Oups… L’API n’a pas renvoyé du JSON.\n\nStatut: ${res.status}\n\nDébut:\n${text.slice(0, 300)}`
        );
        return;
      }

      const data: { story?: string; error?: string } = await res.json();
      setRawStory(data.story ?? `Oups… ${data.error ?? "Erreur inconnue"}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur réseau";
      setRawStory(`Oups… ${message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function clearAll() {
    setKeywords("");
    setMoral("");
    setRawStory("");
    setMinutes(5);
    setStyle("Cozy");
  }

  const isDisabled = !canGenerate || isLoading;

  return (
    <main className="container">
      {/* Header */}
      <div className="headerRow">
        <div className="headerLeft">
          <h1 className="pageTitle">Histoires du soir</h1>
          <div className="subtitle">
            On choisit ensemble une durée, un style, quelques mots rigolos… et une petite leçon à
            apprendre. Puis on lit tranquillement 📖✨
          </div>
        </div>

        <div className="headerActions">
          <Link href="/" className="btn" aria-label="Retour à l’accueil" title="Retour">
            🏠 Accueil
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="cardSoft contentWrapper">
        <div className="controlsGrid">
          <label className="label">
            Durée
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value) as StoryMinutes)}
              className="field"
            >
              <option value={3}>3 minutes (petite histoire)</option>
              <option value={5}>5 minutes (histoire moyenne)</option>
              <option value={10}>10 minutes (grande histoire)</option>
            </select>
          </label>

          <label className="label">
            Style
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as StoryStyle)}
              className="field"
            >
              <option value="Cozy">Doudou</option>
              <option value="Funny">Drôle</option>
              <option value="Adventure">Aventure</option>
              <option value="Magical">Magique</option>
              <option value="Sci-Fi">Science-fiction</option>
            </select>
          </label>

          <label className="label fullRow">
            Mots-clés (séparés par des virgules)
            <input
              name="keywords"
              autoComplete="off"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="ex : dragon, lune, cookies, dinosaure…"
              className="field"
            />
            <span className="helper">Astuce : 2 à 5 mots, c’est parfait.</span>
          </label>

          <label className="label fullRow">
            La morale (ce qu&apos;on veut apprendre)
            <input
              name="moral"
              autoComplete="off"
              value={moral}
              onChange={(e) => setMoral(e.target.value)}
              placeholder="ex : partager, être gentil, dire la vérité…"
              className="field"
            />
            <span className="helper">Exemple : “être patient quand on attend”.</span>
          </label>

          <div className="fullRow">
            <button className="btn btnPrimary" onClick={generateStory} disabled={isDisabled}>
              {isLoading ? "Je crée l’histoire…" : "Créer une histoire ✨"}
            </button>
          </div>

          <div className="fullRow">
            <button className="btn" onClick={clearAll} disabled={isLoading}>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Book output */}
      {story && (
        <article className="bookCard">
          <h2 className="storyTitle">{story.title}</h2>

          {story.chapters.map((ch, i) => (
            <section key={i} style={{ marginTop: i === 0 ? 16 : 22 }}>
              <h3 className="chapterHeading">{ch.heading}</h3>
              {ch.paragraphs.map((p, idx) => (
                <p key={idx} className="paragraph">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </article>
      )}
    </main>
  );
}
