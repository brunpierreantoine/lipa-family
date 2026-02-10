"use client";

import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCachedOrNull, useIdentityCache } from "@/lib/identity/useIdentityCache";

export default function CachedFamilyName() {
  const supabase = useMemo(() => createClient(), []);
  const { identity, cacheReady, reconcileIdentity } = useIdentityCache();

  useEffect(() => {
    let cancelled = false;

    void reconcileIdentity(async () => {
      const { data: memberships } = await supabase
        .from("memberships")
        .select("families(display_name, ai_profile)")
        .limit(1);

      if (cancelled || !memberships || memberships.length === 0) {
        return null;
      }

      const familyData = Array.isArray(memberships[0].families) ? memberships[0].families[0] : memberships[0].families;
      const next: { familyName?: string; familyProfile?: string } = {};
      if (typeof familyData?.display_name === "string") {
        next.familyName = familyData.display_name;
      }
      if (typeof familyData?.ai_profile === "string") {
        next.familyProfile = familyData.ai_profile;
      }
      return {
        ...next,
      };
    });

    return () => {
      cancelled = true;
    };
  }, [reconcileIdentity, supabase]);

  const displayedFamilyName = getCachedOrNull(identity, "familyName");
  if (!cacheReady || displayedFamilyName === null) {
    return (
      <>
        <div className="h-8 w-56 skeleton mb-3" aria-hidden="true" />
        <div className="h-4 w-96 max-w-full skeletonSoft" aria-hidden="true" />
      </>
    );
  }

  return (
    <>
      <h1 className="pageTitle">{displayedFamilyName}</h1>
      <div className="subtitle">
        Bienvenue dans votre espace familial. Retrouvez ici tous vos outils et réglages.
      </div>
    </>
  );
}
