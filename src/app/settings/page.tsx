import { createClient } from "@/lib/supabase/server";
import { DEFAULT_FAMILY_PROFILE } from "@/lib/storyDefaults";
import SettingsContainer from "./SettingsContainer";
import { Suspense } from "react";

async function SettingsDataFetcher() {
  const supabase = await createClient();

  // Fetch memberships directly. Securely handled by Middleware + RLS.
  const { data: memberships } = await supabase
    .from("memberships")
    .select("family_id, role, families(display_name, ai_profile)")
    .limit(1);

  let initialData = {
    initialFamilyName: "",
    initialProfile: DEFAULT_FAMILY_PROFILE,
    initialRole: "Member" as "Admin" | "Member",
    initialFamilyId: null as string | null
  };

  if (memberships && memberships.length > 0) {
    const active = memberships[0];
    const familyData = Array.isArray(active.families) ? active.families[0] : active.families;

    initialData = {
      initialFamilyId: active.family_id,
      initialRole: active.role,
      initialFamilyName: familyData?.display_name || "",
      initialProfile: familyData?.ai_profile || DEFAULT_FAMILY_PROFILE,
    };
  }

  return <SettingsContainer {...initialData} />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsDataFetcher />
    </Suspense>
  );
}

function SettingsSkeleton() {
  return (
    <main className="container animate-pulse">
      <div className="headerRow">
        <div className="headerLeft">
          <div className="h-8 w-48 skeleton mb-3"></div>
          <div className="h-4 w-96 max-w-full skeletonSoft"></div>
        </div>
        <div className="headerActions">
          <div className="h-11 w-28 skeleton" style={{ borderRadius: '14px' }}></div>
        </div>
      </div>
      <div className="cardSoft mt-8 p-8">
        <div className="controlsGrid">
          <div className="fullRow h-20 skeletonSoft mb-4"></div>
          <div className="fullRow h-40 skeletonSoft mb-4"></div>
          <div className="fullRow h-12 skeletonSoft"></div>
        </div>
      </div>
    </main>
  );
}