"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createFamily(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const profile = formData.get("profile") as string;

    if (!name) {
        throw new Error("Family name is required");
    }

    // 1. Create the family
    const { data: family, error: familyError } = await supabase
        .from("families")
        .insert({ display_name: name, ai_profile: profile })
        .select()
        .single();

    if (familyError || !family) {
        throw new Error(familyError?.message || "Failed to create family");
    }

    // 2. Create the membership (Admin)
    const { error: memberError } = await supabase
        .from("memberships")
        .insert({
            user_id: user.id,
            family_id: family.id,
            role: "Admin",
        });

    if (memberError) {
        throw new Error(memberError.message);
    }

    redirect("/");
}
