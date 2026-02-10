"use client";

import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasCachedField, useIdentityCache, warnIfCachedFieldFallsBack } from "@/lib/identity/useIdentityCache";

export default function CachedFamilyName() {
  const supabase = useMemo(() => createClient(), []);
  const { identity, reconcileIdentity } = useIdentityCache();
  const hasCachedFamilyName = hasCachedField(identity, "familyName");

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

  const displayedFamilyName = hasCachedFamilyName ? identity.familyName ?? "" : "Lipa Family";

  useEffect(() => {
    warnIfCachedFieldFallsBack(identity, "familyName", displayedFamilyName === "Lipa Family", "CachedFamilyName");
  }, [identity, displayedFamilyName]);

  return <h1 className="pageTitle">{displayedFamilyName}</h1>;
}
