"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DEFAULT_FAMILY_PROFILE } from "@/lib/storyDefaults";
import { createClient } from "@/lib/supabase/client";
import { getCachedOrNull, useIdentityCache } from "@/lib/identity/useIdentityCache";

export default function SettingsContainer() {
    const supabase = useMemo(() => createClient(), []);
    const { identity, cacheReady, isReconciling, setAuthoritativeIdentity, reconcileIdentity } = useIdentityCache();
    const [profile, setProfile] = useState(DEFAULT_FAMILY_PROFILE);
    const [familyName, setFamilyName] = useState("");
    const [nameDirty, setNameDirty] = useState(false);
    const [profileDirty, setProfileDirty] = useState(false);
    const [role, setRole] = useState<"Admin" | "Member" | null>(null);
    const [familyId, setFamilyId] = useState<string | null>(null);
    const cachedFamilyName = getCachedOrNull(identity, "familyName");
    const cachedFamilyProfile = getCachedOrNull(identity, "familyProfile");

    useEffect(() => {
        if (profileDirty) return;
        if (!cacheReady) return;
        if (cachedFamilyProfile !== null) {
            setProfile(cachedFamilyProfile);
            return;
        }
        setProfile(DEFAULT_FAMILY_PROFILE);
    }, [cacheReady, cachedFamilyProfile, profileDirty]);

    useEffect(() => {
        if (nameDirty) return;
        if (!cacheReady) return;
        if (cachedFamilyName !== null) {
            setFamilyName(cachedFamilyName);
            return;
        }
        setFamilyName("");
    }, [cacheReady, cachedFamilyName, nameDirty]);

    useEffect(() => {
        let cancelled = false;

        void reconcileIdentity(async () => {
            const { data: memberships } = await supabase
                .from("memberships")
                .select("family_id, role, families(display_name, ai_profile)")
                .limit(1);

            if (cancelled || !memberships || memberships.length === 0) {
                setRole("Member");
                setFamilyId(null);
                return null;
            }

            const active = memberships[0];
            const familyData = Array.isArray(active.families) ? active.families[0] : active.families;
            setRole(active.role);
            setFamilyId(active.family_id);

            const next: { familyName?: string; familyProfile?: string } = {};
            if (typeof familyData?.display_name === "string") {
                next.familyName = familyData.display_name;
            }
            if (typeof familyData?.ai_profile === "string") {
                next.familyProfile = familyData.ai_profile;
            }
            return next;
        });

        return () => {
            cancelled = true;
        };
    }, [reconcileIdentity, supabase]);

    async function save() {
        if (role !== "Admin" || !familyId) return;

        const { error } = await supabase
            .from("families")
            .update({
                display_name: familyName,
                ai_profile: profile
            })
            .eq("id", familyId);

        if (error) {
            alert("Erreur lors de la sauvegarde: " + error.message);
            return;
        }

        setAuthoritativeIdentity({
            familyName,
            familyProfile: profile,
        });

        const { triggerConfetti } = await import("@/lib/confetti");
        triggerConfetti();
    }

    return (
        <main className="container">
            {/* Header */}
            <div className="headerRow">
                <div className="headerLeft">
                    <h1 className="pageTitle">Réglages</h1>
                    <div className="subtitle">
                        Gérez votre espace familial et personallisez l&apos;IA.
                    </div>
                </div>

                <div className="headerActions">
                    <Link href="/" className="btn" aria-label="Retour" title="Retour">
                        🏠 Accueil
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="cardSoft contentWrapper">
                <div className="controlsGrid">
                    <label className="label fullRow">
                        Nom de la famille
                        <input
                            className="field"
                            value={familyName}
                            onChange={(e) => {
                                setNameDirty(true);
                                setFamilyName(e.target.value);
                            }}
                            disabled={role !== "Admin"}
                            placeholder="ex: Famille Lipa"
                        />
                    </label>

                    <label className="label fullRow">
                        Profil de famille (contexte IA)
                        <div className="helper" style={{ marginBottom: "12px", fontWeight: "normal" }}>
                            Décrivez votre famille pour personnaliser les histoires (enfants, lieux, passions...).
                        </div>
                        <textarea
                            className="field textarea"
                            rows={10}
                            value={profile}
                            onChange={(e) => {
                                setProfileDirty(true);
                                setProfile(e.target.value);
                            }}
                            disabled={role !== "Admin"}
                            placeholder={DEFAULT_FAMILY_PROFILE}
                        />
                    </label>

                    <div className="fullRow">
                        {role === null || isReconciling ? (
                            <div className="helper" style={{ textAlign: "center" }}>
                                Chargement des réglages...
                            </div>
                        ) : role === "Admin" ? (
                            <button className="btn btnPrimary" onClick={save} style={{ width: "100%" }}>
                                Enregistrer les changements
                            </button>
                        ) : (
                            <div className="helper" style={{ textAlign: "center" }}>
                                🔒 Seuls les administrateurs peuvent modifier ces réglages.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: "40px", textAlign: "center" }}>
                <button
                    className="btn"
                    onClick={() => supabase.auth.signOut().then(() => window.location.href = "/login")}
                    style={{ color: "var(--danger)" }}
                >
                    Se déconnecter
                </button>
            </div>
        </main>
    );
}
