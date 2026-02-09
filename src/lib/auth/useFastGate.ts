 "use client";

// Fast Shell + Client Gate contract:
// - Never blocks initial render; children should render immediately.
// - Redirects only after mount, based on session/membership checks.
// - Canonical client-side gate for auth-dependent UI.

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type FastGateOptions = {
    requireAuth?: boolean;
    requireMembership?: boolean;
    redirectIfAuthed?: boolean;
    authedRedirectTo?: string;
    loginPath?: string;
    membershipRedirectTo?: string;
    nextParam?: string;
};

type FastGateState = {
    isChecking: boolean;
    session: Session | null;
};

// In-memory TTL cache is safe because Supabase RLS is the source of truth,
// and TTLs are intentionally small to avoid stale-auth issues.
const SESSION_TTL_MS = 15_000;
const MEMBERSHIP_TTL_MS = 30_000;

let sessionCache: { session: Session | null; ts: number } | null = null;
let membershipCache: { userId: string; hasMembership: boolean; ts: number } | null = null;

function sanitizeNextPath(raw: string | null, fallback: string) {
    if (!raw) return fallback;
    if (!raw.startsWith('/')) return fallback;
    if (raw.startsWith('//')) return fallback;
    if (raw.startsWith('/login') || raw.startsWith('/onboarding')) return fallback;
    return raw;
}

async function getCachedSession(supabase: ReturnType<typeof createClient>) {
    const now = Date.now();
    if (sessionCache && now - sessionCache.ts < SESSION_TTL_MS) {
        return sessionCache.session;
    }

    const { data: { session } } = await supabase.auth.getSession();
    sessionCache = { session, ts: now };
    return session;
}

async function getCachedMembership(
    supabase: ReturnType<typeof createClient>,
    userId: string
) {
    const now = Date.now();
    if (
        membershipCache &&
        membershipCache.userId === userId &&
        now - membershipCache.ts < MEMBERSHIP_TTL_MS
    ) {
        return membershipCache.hasMembership;
    }

    const { data: memberships, error } = await supabase
        .from("memberships")
        .select("family_id")
        .limit(1);

    const hasMembership = !error && !!memberships && memberships.length > 0;
    membershipCache = { userId, hasMembership, ts: now };
    return hasMembership;
}

export function useFastGate(options: FastGateOptions = {}) {
    const {
        requireAuth = true,
        requireMembership = false,
        redirectIfAuthed = false,
        authedRedirectTo = "/",
        loginPath = "/login",
        membershipRedirectTo = "/",
        nextParam = "next",
    } = options;

    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [state, setState] = useState<FastGateState>({
        isChecking: true,
        session: null,
    });

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            sessionCache = null;
            membershipCache = null;
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const session = await getCachedSession(supabase);
            if (cancelled) return;

            setState({ isChecking: false, session });

            const rawNext = searchParams.get(nextParam);
            const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
            const nextPath = sanitizeNextPath(rawNext, currentPath);

            if (!session?.user) {
                if (requireAuth) {
                    router.replace(`${loginPath}?${nextParam}=${encodeURIComponent(nextPath)}`);
                }
                return;
            }

            if (redirectIfAuthed) {
                router.replace(nextPath || authedRedirectTo);
                return;
            }

            if (requireMembership) {
                const hasMembership = await getCachedMembership(supabase, session.user.id);
                if (cancelled) return;
                if (hasMembership) {
                    router.replace(membershipRedirectTo);
                }
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [
        supabase,
        router,
        pathname,
        searchParams,
        requireAuth,
        requireMembership,
        redirectIfAuthed,
        authedRedirectTo,
        loginPath,
        membershipRedirectTo,
        nextParam,
    ]);

    return state;
}
