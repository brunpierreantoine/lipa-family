"use client";

import { useCallback, useMemo, useState } from "react";

export type IdentityCacheValue = {
  familyName?: string;
  familyProfile?: string;
};

const IDENTITY_CACHE_KEY = "lipa.identity.v1";

function sanitizeIdentity(value: IdentityCacheValue): IdentityCacheValue {
  const next: IdentityCacheValue = {};
  if (typeof value.familyName === "string") next.familyName = value.familyName;
  if (typeof value.familyProfile === "string") next.familyProfile = value.familyProfile;
  return next;
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
    setIdentity(next);
    writeIdentityCache(next);
  }, []);

  const reconcileIdentity = useCallback(async (loader: () => Promise<IdentityCacheValue | null>) => {
    setIsReconciling(true);
    try {
      const serverValue = await loader();
      if (!serverValue) return null;
      const next = sanitizeIdentity(serverValue);
      setIdentity((prev) => {
        if (prev.familyName === next.familyName && prev.familyProfile === next.familyProfile) {
          return prev;
        }
        writeIdentityCache(next);
        return next;
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
