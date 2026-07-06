"use client";

import Link from "next/link";
import { useState } from "react";
import { login } from "../actions";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await login(null, formData);
    if (result && "success" in result && result.success) {
      window.location.href = "/admin";
    } else if (result && "error" in result) {
      setError(result.error);
      setPending(false);
    } else {
      setPending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="pixel-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 border-[3px] border-accent flex items-center justify-center">
              <span className="font-[family-name:var(--font-press-start)] text-xl text-accent">A</span>
            </div>
            <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green mb-2">
              ADMIN ACCESS
            </h1>
            <p className="font-[family-name:var(--font-vt323)] text-lg text-text-muted">
              Enter password to access admin panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                name="password"
                required
                autoFocus
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <div className="pixel-card p-3 border-accent">
                <p className="font-[family-name:var(--font-press-start)] text-[8px] text-accent">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="retro-btn retro-btn-primary w-full"
            >
              {pending ? "AUTHENTICATING..." : "LOGIN"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/admin/recovery"
              className="font-[family-name:var(--font-vt323)] text-xs text-text-muted hover:text-danger"
            >
              Lost access? Admin Recovery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
