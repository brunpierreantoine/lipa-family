import { createClient } from "@/lib/supabase/server";
import { DEFAULT_FAMILY_PROFILE } from "@/lib/storyDefaults";
import { redirect } from "next/navigation";
import StoryContainer from "./StoryContainer";

export default async function StoryPage() {
  const supabase = await createClient();

  // Fetch only memberships. Auth is securely handled by Middleware.
  const { data: memberships } = await supabase
    .from("memberships")
    .select("families(ai_profile)");

  let familyProfile = DEFAULT_FAMILY_PROFILE;
  if (memberships && memberships.length > 0) {
    // @ts-ignore
    const familyData = Array.isArray(memberships[0].families) ? memberships[0].families[0] : memberships[0].families;
    familyProfile = familyData?.ai_profile || DEFAULT_FAMILY_PROFILE;
  }

  return <StoryContainer initialFamilyProfile={familyProfile} />;
}
