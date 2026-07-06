"use client";

import Link from "next/link";
import { useState } from "react";
import { loginUser } from "../actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await loginUser({ email, password });
    if (result.success) {
      window.location.href = "/user";
    } else {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-press-start)] text-xl text-primary crt-glow-green mb-2">PLAYER LOGIN</h1>
          <p className="font-[family-name:var(--font-vt323)] text-lg text-text-muted">Enter the arena</p>
        </div>

        <div className="pixel-card p-6 border-primary">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-danger/10 border-2 border-danger p-3 font-[family-name:var(--font-vt323)] text-sm text-danger">{error}</div>
            )}

            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]" required />
            </div>

            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">PASSWORD</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]" required />
            </div>

            <button type="submit" disabled={loading} className="retro-btn retro-btn-primary w-full">
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>

            <div className="text-center">
              <Link href="/user/contact" className="font-[family-name:var(--font-vt323)] text-sm text-accent hover:text-secondary">Forgot Password? Contact Admin</Link>
            </div>
          </form>

          <div className="mt-4 text-center">
            <Link href="/user/register" className="font-[family-name:var(--font-vt323)] text-sm text-primary hover:text-secondary">Don&apos;t have an account? Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
