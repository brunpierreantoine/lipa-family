"use client";

import { useState } from "react";
import Link from "next/link";
import { DEFAULT_FAMILY_PROFILE } from "@/lib/storyDefaults";
import { createClient } from "@/lib/supabase/client";

interface SettingsContainerProps {
    initialFamilyName: string;
    initialProfile: string;
    initialRole: "Admin" | "Member";
    initialFamilyId: string | null;
}

export default function SettingsContainer({
    initialFamilyName,
    initialProfile,
    initialRole,
    initialFamilyId
}: SettingsContainerProps) {
    const [profile, setProfile] = useState(initialProfile || DEFAULT_FAMILY_PROFILE);
    const [familyName, setFamilyName] = useState(initialFamilyName || "");
    const [role] = useState(initialRole);
    const [familyId] = useState(initialFamilyId);

    const supabase = createClient();

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
                            onChange={(e) => setFamilyName(e.target.value)}
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
                            onChange={(e) => setProfile(e.target.value)}
                            disabled={role !== "Admin"}
                            placeholder={DEFAULT_FAMILY_PROFILE}
                        />
                    </label>

                    <div className="fullRow">
                        {role === "Admin" ? (
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
