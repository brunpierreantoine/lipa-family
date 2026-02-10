"use client";

import { useCallback, useLayoutEffect, useMemo, useState } from "react";

export type IdentityCacheValue = {
  familyName?: string;
  familyProfile?: string;
};

const IDENTITY_CACHE_KEY = "lipa.identity.v1";

// Future extension point:
// - display preferences
// - UI-only onboarding continuation state
// Keep persisted fields display-only. Never store auth, permissions, or write-authority IDs.

function sanitizeIdentity(value: IdentityCacheValue): IdentityCacheValue {
  const next: IdentityCacheValue = {};
  if (typeof value.familyName === "string") next.familyName = value.familyName;
  if (typeof value.familyProfile === "string") next.familyProfile = value.familyProfile;
  return next;
}

export function hasCachedField(identity: IdentityCacheValue, key: keyof IdentityCacheValue) {
  return Object.prototype.hasOwnProperty.call(identity, key);
}

export function getCachedOrNull(identity: IdentityCacheValue, key: keyof IdentityCacheValue) {
  if (!hasCachedField(identity, key)) return null;
  return identity[key] ?? null;
}

export function warnIfCachedFieldFallsBack(
  identity: IdentityCacheValue,
  key: keyof IdentityCacheValue,
  isUsingDefault: boolean,
  context: string
) {
  if (process.env.NODE_ENV !== "development") return;
  if (!hasCachedField(identity, key)) return;
  if (!isUsingDefault) return;
  console.warn(`[identity-cache] Cached field "${key}" regressed to default in ${context}.`);
}

function hasWindow() {
  return typeof window !== "undefined";
}

export function readIdentityCache(): IdentityCacheValue | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.sessionStorage.getItem(IDENTITY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IdentityCacheValue;
    return sanitizeIdentity(parsed);
  } catch {
    return null;
  }
}

export function writeIdentityCache(value: IdentityCacheValue) {
  if (!hasWindow()) return;
  const safe = sanitizeIdentity(value);
  window.sessionStorage.setItem(IDENTITY_CACHE_KEY, JSON.stringify(safe));
}

export function mergeIdentityCache(value: IdentityCacheValue) {
  const current = readIdentityCache() ?? {};
  const incoming = sanitizeIdentity(value);
  const merged: IdentityCacheValue = {
    familyName: hasCachedField(incoming, "familyName") ? incoming.familyName : current.familyName,
    familyProfile: hasCachedField(incoming, "familyProfile") ? incoming.familyProfile : current.familyProfile,
  };
  writeIdentityCache(merged);
  return merged;
}

export function useIdentityCache(initialValue?: IdentityCacheValue) {
  const [identity, setIdentity] = useState<IdentityCacheValue>(() => {
    // Initial render must match server markup to avoid hydration mismatch.
    return sanitizeIdentity(initialValue ?? {});
  });
  const [cacheReady, setCacheReady] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  const mergeStickyIdentity = useCallback((prev: IdentityCacheValue, incomingRaw: IdentityCacheValue) => {
    // Cached identity must never regress once rendered.
    const incoming = sanitizeIdentity(incomingRaw);
    return {
      familyName: hasCachedField(incoming, "familyName") ? incoming.familyName : prev.familyName,
      familyProfile: hasCachedField(incoming, "familyProfile") ? incoming.familyProfile : prev.familyProfile,
    } satisfies IdentityCacheValue;
  }, []);

  useLayoutEffect(() => {
    const cached = readIdentityCache();
    if (cached) {
      setIdentity((prev) => mergeStickyIdentity(prev, cached));
    }
    setCacheReady(true);
  }, [mergeStickyIdentity]);

  const setAuthoritativeIdentity = useCallback((value: IdentityCacheValue) => {
    setIdentity((prev) => {
      // Cached identity must never regress during authoritative updates.
      const merged = mergeStickyIdentity(prev, value);
      writeIdentityCache(merged);
      return merged;
    });
  }, [mergeStickyIdentity]);

  const reconcileIdentity = useCallback(async (loader: () => Promise<IdentityCacheValue | null>) => {
    setIsReconciling(true);
    try {
      const serverValue = await loader();
      if (!serverValue) return null;
      setIdentity((prev) => {
        // Keep previous identity unless each field is explicitly provided by authoritative data.
        // No intermediate empty identity state is allowed.
        // Cached identity must never regress once rendered.
        const merged = mergeStickyIdentity(prev, serverValue);

        if (prev.familyName === merged.familyName && prev.familyProfile === merged.familyProfile) {
          return prev;
        }
        writeIdentityCache(merged);
        return merged;
      });
      return sanitizeIdentity(serverValue);
    } finally {
      setIsReconciling(false);
    }
  }, [mergeStickyIdentity]);

  return useMemo(() => ({
    identity,
    cacheReady,
    isReconciling,
    setAuthoritativeIdentity,
    reconcileIdentity,
  }), [identity, cacheReady, isReconciling, setAuthoritativeIdentity, reconcileIdentity]);
}
