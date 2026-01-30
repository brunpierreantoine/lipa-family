"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { THEME_STORAGE_KEY } from "@/lib/storyDefaults";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
    }
    return "light";
  });

  // Theme sync
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <main className="container">
      {/* Header */}
      <div className="headerRow">
        <div className="headerLeft">
          <h1 className="pageTitle">Lipa Family</h1>
          <div className="subtitle">
            Bienvenue dans votre espace familial. Retrouvez ici tous vos outils et réglages.
          </div>
        </div>

        <div className="headerActions">
          <button
            className="btn"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            aria-label="Basculer le thème"
            title="Basculer le thème"
          >
            {theme === "light" ? "🌙 Mode nuit" : "☀️ Mode jour"}
          </button>

          <Link href="/settings" className="btn" aria-label="Réglages" title="Réglages">
            ⚙️
          </Link>
        </div>
      </div>

      {/* Portal Grid */}
      <div className="portalGrid">
        <Link href="/stories" className="portalCard">
          <div className="cardIcon">📖</div>
          <h2 className="cardTitle">Générer une histoire</h2>
          <p className="cardDesc">
            Créez des histoires personnalisées pour vos enfants en quelques clics.
          </p>
        </Link>

        {/* Placeholder for future tools */}
        <div className="portalCard disabled">
          <div className="cardIcon">⏳</div>
          <h2 className="cardTitle">À venir...</h2>
          <p className="cardDesc">
            De nouveaux outils pour toute la famille arrivent bientôt.
          </p>
        </div>
      </div>
    </main>
  );
}