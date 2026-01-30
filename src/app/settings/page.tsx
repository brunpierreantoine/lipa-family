import { createClient } from "@/lib/supabase/server";
import { DEFAULT_FAMILY_PROFILE } from "@/lib/storyDefaults";
import { redirect } from "next/navigation";
import SettingsContainer from "./SettingsContainer";

export default async function SettingsPage() {
  const supabase = await createClient();

  // Fetch memberships directly. Securely handled by Middleware + RLS.
  const { data: memberships } = await supabase
    .from("memberships")
    .select("family_id, role, families(display_name, ai_profile)");

  let initialData = {
    initialFamilyName: "",
    initialProfile: DEFAULT_FAMILY_PROFILE,
    initialRole: "Member" as "Admin" | "Member",
    initialFamilyId: null as string | null
  };

  if (memberships && memberships.length > 0) {
    const active = memberships[0];
    // @ts-ignore
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