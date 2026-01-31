'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // In a real app, you would log to an error monitoring tool
        console.error('Lipa Family Runtime Error:', error);
    }, [error]);

    const isEnvError = error.message.toLowerCase().includes('env') || error.message.toLowerCase().includes('supabase');

    return (
        <main className="container" style={{ paddingTop: '15vh', textAlign: 'center' }}>
            <div className="cardSoft" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
                <h1 className="pageTitle" style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️ Oups !</h1>
                <p className="subtitle" style={{ marginBottom: '2rem' }}>
                    {isEnvError
                        ? "Il semble que la configuration de la plateforme (Supabase) soit manquante ou incorrecte sur ce déploiement. Vérifiez les variables d'environnement."
                        : "Une erreur inattendue s'est produite lors du chargement de la page."}
                </p>

                <div className="controlsGrid">
                    <button onClick={() => reset()} className="btn btnPrimary">
                        Réessayer
                    </button>
                    <a href="/" className="btn">
                        Accueil
                    </a>
                </div>

                <div style={{ marginTop: '2.5rem', opacity: 0.6 }}>
                    <p className="helper">Code d'erreur : {error.digest || 'N/A'}</p>
                    {process.env.NODE_ENV !== 'production' && (
                        <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '10px', borderRadius: '8px', overflow: 'auto', marginTop: '10px' }}>
                            {error.message}
                        </pre>
                    )}
                </div>
            </div>
        </main>
    );
}
