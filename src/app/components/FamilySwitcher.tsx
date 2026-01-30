"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Family {
    id: string;
    display_name: string;
}

export default function FamilySwitcher({
    families,
    activeFamilyId
}: {
    families: Family[],
    activeFamilyId: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClient();

    const handleSwitch = async (familyId: string) => {
        // For MVP, we'll store the "last session family" in a cookie or metadata
        // But since the current Home page just takes the first one, we'll need a way 
        // to "pin" a family. For now, we'll use a simple localStorage hint that 
        // the Home page can use to reorder or pick.
        localStorage.setItem("lipa_pinned_family", familyId);
        window.location.reload();
    };

    if (families.length <= 1) return null;

    return (
        <div className="dropdown" style={{ position: "relative" }}>
            <button
                className="btn"
                onClick={() => setIsOpen(!isOpen)}
                style={{ gap: "8px" }}
            >
                📂 Famille
            </button>

            {isOpen && (
                <div className="cardSoft dropdownMenu" style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "10px",
                    zIndex: 100,
                    minWidth: "200px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                }}>
                    {families.map((f) => (
                        <button
                            key={f.id}
                            className={`btn ${f.id === activeFamilyId ? "btnPrimary" : ""}`}
                            onClick={() => handleSwitch(f.id)}
                            style={{ width: "100%", justifyContent: "flex-start", padding: "12px 16px" }}
                        >
                            {f.display_name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
