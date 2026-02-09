"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    useEffect(() => {
        let cancelled = false;

        const redirectIfAuthed = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (cancelled) return;
            if (session?.user) {
                const next = searchParams.get("next");
                router.replace(next || "/");
            }
        };

        redirectIfAuthed();

        return () => {
            cancelled = true;
        };
    }, [router, searchParams, supabase]);

    const handleGoogleLogin = async () => {
        const next = searchParams.get("next");
        const redirectTo = next
            ? `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`
            : `${window.location.origin}/api/auth/callback`;

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
                >
                    <span>Connexion avec Google</span>
                </button>

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
