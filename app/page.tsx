"use client";

import { useMemo, useState } from "react";

type StoryStyle = "Cozy" | "Funny" | "Adventure" | "Magical" | "Sci-Fi";
type StoryMinutes = 3 | 5 | 10;

function styleLabel(style: StoryStyle) {
  switch (style) {
    case "Cozy":
      return "Doudou & réconfortant";
    case "Funny":
      return "Drôle";
    case "Adventure":
      return "Aventure";
    case "Magical":
      return "Magique";
    case "Sci-Fi":
      return "Science-fiction";
    default:
      return style;
  }
}

export default function Home() {
  const [minutes, setMinutes] = useState<StoryMinutes>(5);
  const [style, setStyle] = useState<StoryStyle>("Cozy");
  const [keywords, setKeywords] = useState("");
  const [moral, setMoral] = useState("");

  const [story, setStory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canGenerate = useMemo(() => {
    return keywords.trim().length > 0 || moral.trim().length > 0;
  }, [keywords, moral]);

  async function generateStory() {
    setIsLoading(true);
    setStory("Je fabrique l’histoire… ✨");

    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes, style, keywords, moral }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        setStory(
          `Oups… L’API n’a pas renvoyé du JSON.\n\nStatut: ${res.status}\n\nDébut de la réponse:\n${text.slice(
            0,
            300
          )}`
        );
        return;
      }

      const data: { story?: string; error?: string } = await res.json();
      setStory(data.story ?? `Oups… ${data.error ?? "Erreur inconnue"}`);
    } catch (e: any) {
      setStory(`Oups… ${e?.message ?? "Erreur réseau"}`);
    } finally {
      setIsLoading(false);
    }
  }

  function clearAll() {
    setKeywords("");
    setMoral("");
    setStory("");
    setMinutes(5);
    setStyle("Cozy");
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 30, marginBottom: 8 }}>Générateur d’histoires du soir</h1>
      <p style={{ marginTop: 0, opacity: 0.85, lineHeight: 1.4 }}>
        On choisit ensemble une durée, un style, quelques mots rigolos… et une petite leçon à apprendre.
        Puis on clique et hop — une histoire en français ✨
      </p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginTop: 18 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Durée
          <select
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value) as StoryMinutes)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          >
            <option value={3}>3 minutes (petite histoire)</option>
            <option value={5}>5 minutes (histoire moyenne)</option>
            <option value={10}>10 minutes (grande histoire)</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Style
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as StoryStyle)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          >
            <option value="Cozy">{styleLabel("Cozy")}</option>
            <option value="Funny">{styleLabel("Funny")}</option>
            <option value="Adventure">{styleLabel("Adventure")}</option>
            <option value="Magical">{styleLabel("Magical")}</option>
            <option value="Sci-Fi">{styleLabel("Sci-Fi")}</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
          Mots-clés (séparés par des virgules)
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="ex : dragon, lune, cookies, dinosaure…"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
          <span style={{ fontSize: 12, opacity: 0.7 }}>
            Astuce : choisis 2 à 5 mots, ça marche très bien.
          </span>
        </label>

        <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
          La morale (ce qu’on veut apprendre)
          <input
            value={moral}
            onChange={(e) => setMoral(e.target.value)}
            placeholder="ex : partager, être gentil, dire la vérité, être courageux…"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
          <span style={{ fontSize: 12, opacity: 0.7 }}>
            Exemple : “être patient quand on attend” ou “aider un ami”.
          </span>
        </label>

        <button
          onClick={generateStory}
          disabled={!canGenerate || isLoading}
          style={{
            gridColumn: "1 / -1",
            padding: 12,
            borderRadius: 12,
            border: "none",
            cursor: canGenerate && !isLoading ? "pointer" : "not-allowed",
            fontSize: 16,
            opacity: canGenerate && !isLoading ? 1 : 0.5,
          }}
        >
          {isLoading ? "Je crée l’histoire…" : "Créer une histoire ✨"}
        </button>

        <button
          onClick={clearAll}
          disabled={isLoading}
          style={{
            gridColumn: "1 / -1",
            padding: 10,
            borderRadius: 12,
            border: "1px solid #ccc",
            background: "transparent",
            cursor: !isLoading ? "pointer" : "not-allowed",
            fontSize: 14,
            opacity: !isLoading ? 1 : 0.6,
          }}
        >
          Réinitialiser
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Ton histoire
          <textarea
            value={story}
            readOnly
            placeholder="L’histoire apparaîtra ici…"
            rows={16}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ccc",
              width: "100%",
              lineHeight: 1.6,
              fontSize: 15,
            }}
          />
        </label>

        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 10, lineHeight: 1.4 }}>
          Conseil : si tu veux une histoire plus drôle, mets un mot-clé rigolo (ex : “chaussette”)
          et une morale simple (ex : “dire merci”).
        </p>
      </div>
    </main>
  );
}