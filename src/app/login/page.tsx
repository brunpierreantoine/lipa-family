"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useFastGate } from "@/lib/auth/useFastGate";

function LoginContent() {
    const supabase = useMemo(() => createClient(), []);
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const [isRedirecting, setIsRedirecting] = useState(false);

    useFastGate({ requireAuth: false, redirectIfAuthed: true });

    const handleGoogleLogin = async () => {
        setIsRedirecting(true);
        const next = searchParams.get("next");
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const callbackUrl = new URL("/api/auth/callback", baseUrl);
        if (next) callbackUrl.searchParams.set("next", next);
        const redirectTo = callbackUrl.toString();

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo,
            },
        });
    };

    return (
        <div className="contentWrapper" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <div className="headerLeft text-center" style={{ marginBottom: "2rem" }}>
                <h1 className="pageTitle">Lipa Family</h1>
                <p className="subtitle">
                    Histoires et outils pour toute la famille.
                </p>
            </div>

            <div className="cardSoft" style={{ padding: "40px" }}>
                {error === "not_authorized" && (
                    <div
                        className="cardSoft"
                        style={{
                            backgroundColor: "rgba(255, 0, 0, 0.05)",
                            border: "1px solid var(--danger)",
                            color: "var(--danger)",
                            marginBottom: "24px",
                            padding: "16px",
                            borderRadius: "12px",
                            fontSize: "0.9rem"
                        }}
                    >
                        🚫 <strong>Accès limité</strong><br />
                        Votre email n&apos;est pas encore dans la liste des utilisateurs autorisés.
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    className="btn btnPrimary"
                    style={{ gap: "10px" }}
                    disabled={isRedirecting}
                    aria-busy={isRedirecting}
                >
                    <span>{isRedirecting ? "Redirection vers Google..." : "Connexion avec Google"}</span>
                </button>

                {isRedirecting && (
                    <p className="helper" style={{ textAlign: "center", marginTop: "16px" }} aria-live="polite">
                        Connexion en cours… Si une fenêtre Google s’ouvre, suivez les instructions.
                    </p>
                )}

                <p className="helper" style={{ textAlign: "center", marginTop: "24px" }}>
                    L&apos;accès est actuellement limité. Contactez l&apos;administrateur pour rejoindre la plateforme.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <main className="container" style={{ paddingTop: "10vh" }}>
            <Suspense fallback={<div className="container" style={{ textAlign: "center" }}>Chargement...</div>}>
                <LoginContent />
            </Suspense>
        </main>
    );
}
