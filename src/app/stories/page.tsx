import { createClient } from "@/lib/supabase/server";
import { DEFAULT_FAMILY_PROFILE } from "@/lib/storyDefaults";
import StoryContainer from "./StoryContainer";
import { Suspense } from "react";

async function StoryDataFetcher() {
  const supabase = await createClient();

  // Fetch only memberships. Auth is securely handled by Middleware.
  const { data: memberships } = await supabase
    .from("memberships")
    .select("families(ai_profile)")
    .limit(1);

  let familyProfile = DEFAULT_FAMILY_PROFILE;
  if (memberships && memberships.length > 0) {
    const familyData = Array.isArray(memberships[0].families) ? memberships[0].families[0] : memberships[0].families;
    familyProfile = familyData?.ai_profile || DEFAULT_FAMILY_PROFILE;
  }

  return <StoryContainer initialFamilyProfile={familyProfile} />;
}

export default function StoryPage() {
  return (
    <Suspense fallback={<StorySkeleton />}>
      <StoryDataFetcher />
    </Suspense>
  );
}

function StorySkeleton() {
  return (
    <main className="container animate-pulse">
      <div className="headerRow">
        <div className="headerLeft">
          <div className="h-8 w-64 skeleton mb-3"></div>
          <div className="h-4 w-96 max-w-full skeletonSoft"></div>
        </div>
        <div className="headerActions">
          <div className="h-11 w-28 skeleton" style={{ borderRadius: '14px' }}></div>
        </div>
      </div>
      <div className="cardSoft mt-8 p-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 skeletonSoft"></div>
          <div className="h-20 skeletonSoft"></div>
          <div className="h-20 col-span-2 skeletonSoft"></div>
          <div className="h-20 col-span-2 skeletonSoft"></div>
        </div>
      </div>
    </main>
  );
}
