"use client";

import { useCallback, useMemo, useState } from "react";

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
  const merged = sanitizeIdentity({
    familyName: value.familyName ?? current.familyName,
    familyProfile: value.familyProfile ?? current.familyProfile,
  });
  writeIdentityCache(merged);
  return merged;
}

export function useIdentityCache(initialValue?: IdentityCacheValue) {
  const [identity, setIdentity] = useState<IdentityCacheValue>(() => {
    const cached = readIdentityCache();
    return cached ?? sanitizeIdentity(initialValue ?? {});
  });
  const [isReconciling, setIsReconciling] = useState(false);

  const setAuthoritativeIdentity = useCallback((value: IdentityCacheValue) => {
    const next = sanitizeIdentity(value);
    setIdentity((prev) => {
      // Cached identity must never regress during reconciliation or authoritative updates.
      const merged: IdentityCacheValue = {
        familyName: hasCachedField(next, "familyName") ? next.familyName : prev.familyName,
        familyProfile: hasCachedField(next, "familyProfile") ? next.familyProfile : prev.familyProfile,
      };
      writeIdentityCache(merged);
      return merged;
    });
  }, []);

  const reconcileIdentity = useCallback(async (loader: () => Promise<IdentityCacheValue | null>) => {
    setIsReconciling(true);
    try {
      const serverValue = await loader();
      if (!serverValue) return null;
      const next = sanitizeIdentity(serverValue);
      setIdentity((prev) => {
        // Keep previous identity unless each field is explicitly provided by authoritative data.
        // No intermediate empty identity state is allowed.
        // Cached identity must never regress once rendered.
        const merged: IdentityCacheValue = {
          familyName: hasCachedField(next, "familyName") ? next.familyName : prev.familyName,
          familyProfile: hasCachedField(next, "familyProfile") ? next.familyProfile : prev.familyProfile,
        };

        if (prev.familyName === merged.familyName && prev.familyProfile === merged.familyProfile) {
          return prev;
        }
        writeIdentityCache(merged);
        return merged;
      });
      return next;
    } finally {
      setIsReconciling(false);
    }
  }, []);

  return useMemo(() => ({
    identity,
    isReconciling,
    setAuthoritativeIdentity,
    reconcileIdentity,
  }), [identity, isReconciling, setAuthoritativeIdentity, reconcileIdentity]);
}
