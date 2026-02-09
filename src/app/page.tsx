import Link from "next/link";
import ThemeToggle from "@/app/components/ThemeToggle";
import FamilySwitcher from "@/app/components/FamilySwitcher";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login?next=/");
  }

  // Fetch memberships directly. Middleware ensures we have a session.
  // RLS ensures we only see our own data.
  const { data: memberships } = await supabase
    .from("memberships")
    .select("family_id, families(id, display_name)");

  if (!memberships || memberships.length === 0) {
    // If we have a session but no membership, we need onboarding.
    redirect("/onboarding");
  }

  // Simplified "active" logic for Phase 1
  const activeFamily = memberships[0];
  const familyData = Array.isArray(activeFamily.families) ? activeFamily.families[0] : activeFamily.families;
  const familyName = familyData?.display_name || "Lipa Family";

  const allFamilies = memberships
    .map(m => Array.isArray(m.families) ? m.families[0] : m.families)
    .filter(Boolean) as { id: string, display_name: string }[];

  return (
    <main className="container">
      {/* Header */}
      <div className="headerRow">
        <div className="headerLeft">
          <h1 className="pageTitle">{familyName}</h1>
          <div className="subtitle">
            Bienvenue dans votre espace familial. Retrouvez ici tous vos outils et réglages.
          </div>
        </div>

        <div className="headerActions">
          <FamilySwitcher families={allFamilies} activeFamilyId={familyData?.id} />
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
