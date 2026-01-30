import Link from "next/link";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function Home() {
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
          <ThemeToggle />

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