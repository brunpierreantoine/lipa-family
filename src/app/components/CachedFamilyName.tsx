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
  const hasRenderableName = cacheReady && displayedFamilyName !== null && displayedFamilyName.trim().length > 0;

  return (
    <h1 className="pageTitle">
      {hasRenderableName ? (
        displayedFamilyName
      ) : (
        <span aria-hidden="true" style={{ display: "inline-block", minWidth: "10ch", opacity: 0.45 }}>
          ••••••••••
        </span>
      )}
    </h1>
  );
}
