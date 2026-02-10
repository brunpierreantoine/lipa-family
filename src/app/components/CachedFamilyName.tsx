"use client";

import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useIdentityCache } from "@/lib/identity/useIdentityCache";

export default function CachedFamilyName() {
  const supabase = useMemo(() => createClient(), []);
  const { identity, reconcileIdentity } = useIdentityCache();

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
      return {
        familyName: familyData?.display_name || "Lipa Family",
        familyProfile: familyData?.ai_profile || "",
      };
    });

    return () => {
      cancelled = true;
    };
  }, [reconcileIdentity, supabase]);

  return <h1 className="pageTitle">{identity.familyName || "Lipa Family"}</h1>;
}
