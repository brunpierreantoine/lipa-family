"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_FAMILY_PROFILE, SETTINGS_STORAGE_KEY, THEME_STORAGE_KEY } from "@/lib/storyDefaults";

export default function SettingsPage() {
  const [text, setText] = useState(() => {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (existing && existing.trim().length > 0) return existing;
    }
    return DEFAULT_FAMILY_PROFILE;
  });
  const [saved, setSaved] = useState(false);

  // Initial text load removed - now handled in lazy initializer to avoid cascading renders

  // Apply theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  function save() {
    localStorage.setItem(SETTINGS_STORAGE_KEY, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <main className="container">
      {/* Header (same structure as home page) */}
      <div className="headerRow">
        <div className="headerLeft">
          <h1 className="pageTitle">Réglages</h1>
          <div className="subtitle">
            Ces infos servent à rendre les histoires plus cohérentes avec votre famille.
          </div>
        </div>

        <div className="headerActions">
          <Link
            href="/"
            className="btn"
            aria-label="Retour à l’accueil"
            title="Retour"
          >
            🏠 Accueil
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="cardSoft contentWrapper">
        <div className="controlsGrid">
          <label className="label fullRow">
            Profil de famille (modifiable)
            <textarea
              className="field textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={DEFAULT_FAMILY_PROFILE}
              rows={8}
            />
          </label>

          <div className="fullRow">
            <button className="btn btnPrimary" onClick={save}>
              Enregistrer
            </button>
          </div>

          {saved && <div className="fullRow saved">✅ Enregistré</div>}
        </div>
      </div>
    </main>
  );
}