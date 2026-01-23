"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

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

  function pushCurrent() {
    if (!currentHeading && currentBody.length === 0) return;
    const joined = currentBody.join("\n").trim();
    const paragraphs = joined
      ? joined.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
      : [];
    chapters.push({ heading: currentHeading || "Chapitre", paragraphs });
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      currentBody.push("");
      continue;
    }
    if (/^chapitre\s+\d+/i.test(line)) {
      pushCurrent();
      currentHeading = line;
      currentBody = [];
      continue;
    }
    currentBody.push(line);
  }
  pushCurrent();

  if (chapters.length === 0) {
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

  return { title, chapters };
}

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [minutes, setMinutes] = useState<StoryMinutes>(5);
  const [style, setStyle] = useState<StoryStyle>("Cozy");
  const [keywords, setKeywords] = useState("");
  const [moral, setMoral] = useState("");

  const [rawStory, setRawStory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const story = useMemo(() => parseStory(rawStory), [rawStory]);

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
        body: JSON.stringify({ minutes, style, keywords, moral }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        setRawStory(
          `Oups… L’API n’a pas renvoyé du JSON.\n\nStatut: ${res.status}\n\nDébut:\n${text.slice(
            0,
            300
          )}`
        );
        return;
      }

      const data: { story?: string; error?: string } = await res.json();
      setRawStory(data.story ?? `Oups… ${data.error ?? "Erreur inconnue"}`);
    } catch (e: any) {
      setRawStory(`Oups… ${e?.message ?? "Erreur réseau"}`);
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
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <h1 style={{ fontSize: 34, marginBottom: 0 }}>Histoires du soir</h1>
          <div className={styles.subtitle}>
            On choisit ensemble une durée, un style, quelques mots rigolos… et une petite leçon à
            apprendre. Puis on lit tranquillement 📖✨
          </div>
        </div>

        <button
          className={styles.themeToggle}
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          aria-label="Basculer le thème"
        >
          {theme === "light" ? "🌙 Mode nuit" : "☀️ Mode jour"}
        </button>
      </div>

      {/* Controls */}
      <div className={styles.controlsCard}>
        <div className={styles.controlsGrid}>
          <label className={styles.label}>
            Durée
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value) as StoryMinutes)}
              className={styles.field}
            >
              <option value={3}>3 minutes (petite histoire)</option>
              <option value={5}>5 minutes (histoire moyenne)</option>
              <option value={10}>10 minutes (grande histoire)</option>
            </select>
          </label>

          <label className={styles.label}>
            Style
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as StoryStyle)}
              className={styles.field}
            >
              <option value="Cozy">Doudou</option>
              <option value="Funny">Drôle</option>
              <option value="Adventure">Aventure</option>
              <option value="Magical">Magique</option>
              <option value="Sci-Fi">Science-fiction</option>
            </select>
          </label>

          <label className={`${styles.label} ${styles.fullRow}`}>
            Mots-clés (séparés par des virgules)
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="ex : dragon, lune, cookies, dinosaure…"
              className={styles.field}
            />
            <span className={styles.helper}>Astuce : 2 à 5 mots, c’est parfait.</span>
          </label>

          <label className={`${styles.label} ${styles.fullRow}`}>
            La morale (ce qu’on veut apprendre)
            <input
              value={moral}
              onChange={(e) => setMoral(e.target.value)}
              placeholder="ex : partager, être gentil, dire la vérité…"
              className={styles.field}
            />
            <span className={styles.helper}>Exemple : “être patient quand on attend”.</span>
          </label>

          <div className={styles.fullRow}>
            <button className={styles.primaryButton} onClick={generateStory} disabled={isDisabled}>
              {isLoading ? "Je crée l’histoire…" : "Créer une histoire ✨"}
            </button>
          </div>

          <div className={styles.fullRow}>
            <button className={styles.secondaryButton} onClick={clearAll} disabled={isLoading}>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Book output */}
      {story && (
        <article className={styles.bookCard}>
          <h2 className={styles.storyTitle}>{story.title}</h2>

          {story.chapters.map((ch, i) => (
            <section key={i} style={{ marginTop: i === 0 ? 16 : 22 }}>
              <h3 className={styles.chapterHeading}>{ch.heading}</h3>
              {ch.paragraphs.map((p, idx) => (
                <p key={idx} className={styles.paragraph}>
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