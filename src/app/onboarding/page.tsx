"use client";

import { useState } from "react";
import { createFamily } from "./actions";
import { useFastGate } from "@/lib/auth/useFastGate";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [profile, setProfile] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useFastGate({
        requireAuth: true,
        requireMembership: true,
        membershipRedirectTo: "/",
    });

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => setStep((s) => s - 1);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const { triggerConfetti } = await import("@/lib/confetti");
        triggerConfetti();
        // Short delay to let the user see the confetti
        await new Promise(r => setTimeout(r, 800));
        await createFamily(formData);
    };

    return (
        <main className="container" style={{ paddingTop: "5vh" }}>
            <div className="contentWrapper" style={{ maxWidth: "600px", margin: "0 auto" }}>
                <div className="helper" style={{ marginBottom: "1rem" }}>
                    Étape {step} sur 3
                </div>

                <div className="cardSoft" style={{ padding: "40px" }}>
                    <form action={handleSubmit}>
                        <input type="hidden" name="name" value={name} />
                        <input type="hidden" name="profile" value={profile} />

                        {step === 1 && (
                            <div className="fade-in" style={{ display: "grid", gap: "1.5rem" }}>
                                <div className="headerLeft">
                                    <h1 className="pageTitle">Nom de votre famille</h1>
                                    <p className="subtitle">Ce nom sera affiché sur votre page d&apos;accueil.</p>
                                </div>

                                <label className="label">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="ex: Les Lipas, Famille Martin..."
                                        className="field"
                                        required
                                        autoFocus
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="btn btnPrimary"
                                    disabled={!name}
                                >
                                    Continuer
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="fade-in" style={{ display: "grid", gap: "1.5rem" }}>
                                <div className="headerLeft">
                                    <h1 className="pageTitle">Détails de la famille</h1>
                                    <p className="subtitle">
                                        Ces informations aideront l&apos;IA à personnaliser vos histoires.
                                    </p>
                                </div>

                                <label className="label">
                                    <textarea
                                        value={profile}
                                        onChange={(e) => setProfile(e.target.value)}
                                        placeholder="Décris ta famille, vos enfants, vos passions... (Optionnel)"
                                        className="field textarea"
                                        rows={6}
                                    />
                                </label>

                                <div className="controlsGrid" style={{ gridTemplateColumns: "1fr 1.5fr" }}>
                                    <button type="button" onClick={prevStep} className="btn">
                                        Retour
                                    </button>
                                    <button type="button" onClick={nextStep} className="btn btnPrimary">
                                        Continuer
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="fade-in" style={{ display: "grid", gap: "1.5rem" }}>
                                <div className="headerLeft">
                                    <h1 className="pageTitle">On y est !</h1>
                                    <p className="subtitle">
                                        Votre espace est prêt à être configuré.
                                    </p>
                                </div>

                                <div
                                    className="cardSoft"
                                    style={{
                                        padding: "16px",
                                        background: "rgba(0,0,0,0.03)",
                                        borderRadius: "14px"
                                    }}
                                >
                                    <p className="helper" style={{ margin: 0, fontSize: "0.85rem" }}>
                                        💡 Vous pourrez inviter d&apos;autres membres plus tard dans les réglages.
                                    </p>
                                </div>

                                <div className="controlsGrid" style={{ gridTemplateColumns: "1fr 1.5fr" }}>
                                    <button type="button" onClick={prevStep} className="btn" disabled={isSubmitting}>
                                        Retour
                                    </button>
                                    <button type="submit" className="btn btnPrimary" disabled={isSubmitting}>
                                        {isSubmitting ? "Création..." : "C'est parti ! ✨"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </main>
    );
}
