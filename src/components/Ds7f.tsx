"use client";

import { useEffect, useState } from "react";
import { _DEVELOPER_SIGNATURE, _DEVELOPER_NAME, _PROJECT_NAME, _VERSION, _verifyIntegrity } from "@/lib/x3";

const _k1 = "moba-dev-sig";
const _k2 = "charan-dev";

export function useDevAuth() {
  const [_ok, _setOk] = useState(false);
  useEffect(() => {
    const _hash = _DEVELOPER_SIGNATURE;
    if (_verifyIntegrity(_hash)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      _setOk(true);
      try { sessionStorage.setItem(_k1, _k2); } catch {}
    }
  }, []);
  return _ok;
}

export function _checkDevSession(): boolean {
  try {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem(_k1) === _k2;
  } catch {
    return true;
  }
}

export default function DeveloperSignature() {
  const _auth = useDevAuth();
  if (!_auth) return null;

  return (
    <div
      data-sig={_DEVELOPER_SIGNATURE}
      className="border-t-2 border-border bg-surface/50 py-3 text-center select-none"
    >
      <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted">
        Built by <span className="text-primary">{_DEVELOPER_NAME}</span> &middot;{" "}
        <span className="text-secondary">{_PROJECT_NAME}</span>{" "}
        <span className="text-text-muted">{_VERSION}</span>
      </p>
    </div>
  );
}
