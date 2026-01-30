"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_FAMILY_PROFILE, SETTINGS_STORAGE_KEY } from "@/lib/storyDefaults";
import { triggerConfetti } from "@/lib/confetti";

export default function SettingsPage() {
  const [text, setText] = useState(DEFAULT_FAMILY_PROFILE);

  useEffect(() => {
    const existing = localStorage.getItem(SETTINGS_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (existing && existing.trim().length > 0) setText(existing);
  }, []);

  // Initial text load removed - now handled in lazy initializer to avoid cascading renders

  // Theme sync removed - handled globally in layout.tsx via themeScript

  function save() {
    localStorage.setItem(SETTINGS_STORAGE_KEY, text);
    triggerConfetti();
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
              placeholder="Décris ta famille, ou vous habitez, votre cadre de vie, vos enfants, vos animaux de compagnie, vos passions. Cela aidera à rendre les histoires plus personnalisées."
              rows={8}
            />
          </label>

          <div className="fullRow">
            <button className="btn btnPrimary" onClick={save}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}