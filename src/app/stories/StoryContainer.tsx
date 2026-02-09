"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { DEFAULT_FAMILY_PROFILE } from "@/lib/storyDefaults";

type StoryStyle = "Educatif" | "Amusant" | "Aventure" | "Magique";
type StoryUniverse = "Féerique" | "Futuriste / SF" | "Dinosaures" | "Animaux" | "Vie quotidienne";
type StoryMinutes = 3 | 5 | 10;

function parseStory(raw: string) {
    const text = (raw || "").trim();
    if (!text) return null;

    const lines = text.split("\n");
    const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);

    const titleLine = nonEmpty[0] ?? "";
    const title = titleLine.replace(/^[#\s*_-]+/, "").trim() || "Une histoire du soir";

    const chapters: { heading: string; paragraphs: string[] }[] = [];

    let currentHeading = "";
    let currentBody: string[] = [];

    const introLines: string[] = [];

    function bodyToParagraphs(bodyLines: string[]) {
        const joined = bodyLines.join("\n").trim();
        if (!joined) return [];
        return joined
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean);
    }

    function pushCurrent() {
        const paragraphs = bodyToParagraphs(currentBody);
        if (!currentHeading || paragraphs.length === 0) return;
        chapters.push({ heading: currentHeading, paragraphs });
    }

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) {
            if (!currentHeading) introLines.push("");
            else currentBody.push("");
            continue;
        }

        if (/^(?:#+\s*)?chapitre\s+\d+/i.test(line)) {
            pushCurrent();
            currentHeading = line.replace(/^[#\s*_-]+/, "").trim();
            currentBody = [];
            continue;
        }

        if (!currentHeading) introLines.push(line);
        else currentBody.push(line);
    }

    pushCurrent();

    if (chapters.length > 0) {
        const introParagraphs = bodyToParagraphs(introLines);
        if (introParagraphs.length > 0) {
            chapters[0] = {
                ...chapters[0],
                paragraphs: [...introParagraphs, ...chapters[0].paragraphs],
            };
        }
        return { title, chapters };
    }

    const body = nonEmpty.slice(1).join("\n\n").trim();
    return {
        title,
        chapters: [
            {
                heading: "",
                paragraphs: body ? body.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean) : [],
            },
        ],
    };
}

interface StoryContainerProps {
    initialFamilyProfile: string;
}

export default function StoryContainer({ initialFamilyProfile }: StoryContainerProps) {
    const [minutes, setMinutes] = useState<StoryMinutes>(5);
    const [style, setStyle] = useState<StoryStyle>("Amusant");
    const [universe, setUniverse] = useState<StoryUniverse>("Féerique");
    const [keywords, setKeywords] = useState("");
    const [moral, setMoral] = useState("");

    const [familyProfile] = useState(initialFamilyProfile || DEFAULT_FAMILY_PROFILE);
    const [rawStory, setRawStory] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const storyEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (rawStory && !isLoading && !rawStory.startsWith("Je fabrique") && !rawStory.startsWith("Oups")) {
            import("@/lib/confetti").then(m => m.triggerConfetti());
            storyEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [rawStory, isLoading]);

    const story = useMemo(() => {
        if (!rawStory) return null;
        if (rawStory.startsWith("Je fabrique") || rawStory.startsWith("Oups")) return null;
        return parseStory(rawStory);
    }, [rawStory]);

    const canGenerate = useMemo(() => {
        return keywords.trim().length > 0 || moral.trim().length > 0;
    }, [keywords, moral]);

    async function generateStory() {
        setIsLoading(true);
        setRawStory("Je fabrique l’histoire… ✨");

        try {
            const res = await fetch("/api/stories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    minutes,
                    style,
                    universe,
                    keywords,
                    moral,
                    familyProfile
                }),
            });

            const contentType = res.headers.get("content-type") || "";
            if (res.body && contentType.includes("text/plain")) {
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let storyBuffer = "";
                let pendingChunk = "";
                let flushTimer: number | null = null;

                const flush = () => {
                    if (pendingChunk) {
                        storyBuffer += pendingChunk;
                        pendingChunk = "";
                        setRawStory(storyBuffer);
                    }
                    flushTimer = null;
                };

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    if (!value) continue;

                    pendingChunk += decoder.decode(value, { stream: true });
                    if (flushTimer === null) {
                        flushTimer = window.setTimeout(flush, 50);
                    }
                }

                pendingChunk += decoder.decode();
                if (flushTimer !== null) {
                    window.clearTimeout(flushTimer);
                }
                flush();

                if (!storyBuffer.trim()) {
                    setRawStory("Oups… Aucun contenu reçu.");
                }
                return;
            }

            if (!contentType.includes("application/json")) {
                const text = await res.text();
                setRawStory(
                    `Oups… L’API n’a pas renvoyé du JSON.\n\nStatut: ${res.status}\n\nDébut:\n${text.slice(0, 300)}`
                );
                return;
            }

            const data: { story?: string; error?: string } = await res.json();
            setRawStory(data.story ?? `Oups… ${data.error ?? "Erreur inconnue"}`);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Erreur réseau";
            setRawStory(`Oups… ${message}`);
        } finally {
            setIsLoading(false);
        }
    }


    const isDisabled = !canGenerate || isLoading;

    return (
        <main className="container">
            {/* Header */}
            <div className="headerRow">
                <div className="headerLeft">
                    <h1 className="pageTitle">Histoires du soir</h1>
                    <div className="subtitle">
                        On choisit ensemble une durée, un style, un univers… et on crée une histoire magique 📖✨
                    </div>
                </div>

                <div className="headerActions">
                    <Link href="/" className="btn" aria-label="Retour à l’accueil" title="Retour">
                        🏠 Accueil
                    </Link>
                </div>
            </div>

            {/* Controls */}
            <div className="cardSoft contentWrapper">
                <div className="controlsGrid">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="fullRowMobile">
                        <label className="label">
                            Durée
                            <select
                                value={minutes}
                                onChange={(e) => setMinutes(Number(e.target.value) as StoryMinutes)}
                                className="field"
                            >
                                <option value={3}>3 min</option>
                                <option value={5}>5 min</option>
                                <option value={10}>10 min</option>
                            </select>
                        </label>

                        <label className="label">
                            Style
                            <select
                                value={style}
                                onChange={(e) => setStyle(e.target.value as StoryStyle)}
                                className="field"
                            >
                                <option value="Amusant">Amusant</option>
                                <option value="Educatif">Éducatif</option>
                                <option value="Aventure">Aventure</option>
                                <option value="Magique">Magique</option>
                            </select>
                        </label>
                    </div>

                    <label className="label fullRow">
                        Univers
                        <select
                            value={universe}
                            onChange={(e) => setUniverse(e.target.value as StoryUniverse)}
                            className="field"
                        >
                            <option value="Féerique">Féerique (fées, dragons...)</option>
                            <option value="Futuriste / SF">Futuriste / SF (robots, étoiles...)</option>
                            <option value="Dinosaures">Dinosaures (T-Rex, diplodocus...)</option>
                            <option value="Animaux">Animaux (animaux de la forêt, savane...)</option>
                            <option value="Vie quotidienne">Vie quotidienne (école, parc, dodo...)</option>
                        </select>
                    </label>

                    <label className="label fullRow">
                        Mots-clés (séparés par des virgules)
                        <div className="fieldContainer">
                            <input
                                name="keywords"
                                autoComplete="off"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="ex : lune, cookies, dinosaure…"
                                className="field"
                            />
                            {keywords && (
                                <button
                                    type="button"
                                    className="fieldActionBtn"
                                    onClick={() => setKeywords("")}
                                    title="Effacer"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <span className="helper">Astuce : 2 à 5 mots, c’est parfait.</span>
                    </label>

                    <label className="label fullRow">
                        La morale (ce qu&apos;on veut apprendre)
                        <div className="fieldContainer">
                            <input
                                name="moral"
                                autoComplete="off"
                                value={moral}
                                onChange={(e) => setMoral(e.target.value)}
                                placeholder="ex : partager, être gentil, dire la vérité…"
                                className="field"
                            />
                            {moral && (
                                <button
                                    type="button"
                                    className="fieldActionBtn"
                                    onClick={() => setMoral("")}
                                    title="Effacer"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <span className="helper">Exemple : “être patient quand on attend”.</span>
                    </label>

                    <div className="fullRow btnRow" style={{ marginTop: "8px" }}>
                        <button className="btn btnPrimary" onClick={generateStory} disabled={isDisabled}>
                            {isLoading ? "Je crée l’histoire…" : "Créer une histoire ✨"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Book output */}
            <div ref={storyEndRef} style={{ scrollMarginTop: "24px" }}>
                {story && (
                    <article className="bookCard">
                        <h2 className="storyTitle">{story.title}</h2>

                        {story.chapters.map((ch: { heading: string; paragraphs: string[] }, i: number) => (
                            <section key={i} style={{ marginTop: i === 0 ? 16 : 22 }}>
                                {ch.heading && <h3 className="chapterHeading">{ch.heading}</h3>}
                                {ch.paragraphs.map((p: string, idx: number) => (
                                    <p key={idx} className="paragraph">
                                        {p}
                                    </p>
                                ))}
                            </section>
                        ))}
                    </article>
                )}
            </div>
        </main>
    );
}
