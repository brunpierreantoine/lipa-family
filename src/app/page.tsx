import { Suspense, cache } from "react";
import Link from "next/link";
import ThemeToggle from "@/app/components/ThemeToggle";
import FamilySwitcher from "@/app/components/FamilySwitcher";
import CachedFamilyName from "@/app/components/CachedFamilyName";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type FamilyInfo = { id: string; display_name: string };

const getHomeHeaderData = cache(async () => {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("family_id, families(id, display_name)");

  if (!memberships || memberships.length === 0) {
    redirect("/onboarding");
  }

  const activeFamily = memberships[0];
  const familyData = Array.isArray(activeFamily.families) ? activeFamily.families[0] : activeFamily.families;

  const allFamilies = memberships
    .map(m => Array.isArray(m.families) ? m.families[0] : m.families)
    .filter(Boolean) as FamilyInfo[];

  return { allFamilies, activeFamilyId: familyData?.id };
});

async function HomeActions() {
  const { allFamilies, activeFamilyId } = await getHomeHeaderData();
  return (
    <>
      <FamilySwitcher families={allFamilies} activeFamilyId={activeFamilyId} />
      <ThemeToggle />
      <Link href="/settings" prefetch={false} className="btn" aria-label="Réglages" title="Réglages">
        ⚙️
      </Link>
    </>
  );
}

function ActionsFallback() {
  return (
    <>
      <div className="h-11 w-24 skeleton" style={{ borderRadius: "14px" }} />
      <div className="h-11 w-32 skeleton" style={{ borderRadius: "14px" }} />
      <div className="h-11 w-28 skeleton" style={{ borderRadius: "14px" }} />
    </>
  );
}

export default function Home() {
  return (
    <main className="container">
      <div className="headerRow">
        <div className="headerLeft">
          <CachedFamilyName />
          <div className="subtitle">
            Bienvenue dans votre espace familial. Retrouvez ici tous vos outils et réglages.
          </div>
        </div>
        <div className="headerActions" style={{ minHeight: "44px", minWidth: "220px" }}>
          <Suspense fallback={<ActionsFallback />}>
            <HomeActions />
          </Suspense>
        </div>
      </div>

      <div className="portalGrid">
        <Link href="/stories" prefetch={false} className="portalCard">
          <div className="cardIcon">📖</div>
          <h2 className="cardTitle">Générer une histoire</h2>
          <p className="cardDesc">
            Créez des histoires personnalisées pour vos enfants en quelques clics.
          </p>
        </Link>

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
