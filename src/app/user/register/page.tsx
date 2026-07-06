"use client";

import Link from "next/link";
import { useState } from "react";
import { registerUser } from "../actions";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [game, setGame] = useState("freefire");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await registerUser({ email, name, password, game });
    if (result.success) {
      window.location.href = "/user";
    } else {
      setError(result.error || "Registration failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-press-start)] text-xl text-primary crt-glow-green mb-2">
            JOIN THE ARENA
          </h1>
          <p className="font-[family-name:var(--font-vt323)] text-lg text-text-muted">Create your player account</p>
        </div>

        <div className="pixel-card p-6 border-primary">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-danger/10 border-2 border-danger p-3 font-[family-name:var(--font-vt323)] text-sm text-danger">{error}</div>
            )}

            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">NAME</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]" required />
            </div>

            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]" required />
            </div>

            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">PASSWORD</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]" required />
            </div>

            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">CONFIRM PASSWORD</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]" required />
            </div>

            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">GAME</label>
              <select value={game} onChange={(e) => setGame(e.target.value)} className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]">
                <option value="freefire">Free Fire</option>
                <option value="pubg">PUBG</option>
                <option value="cod">Call of Duty</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="retro-btn retro-btn-primary w-full">
              {loading ? "CREATING ACCOUNT..." : "REGISTER"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/user/login" className="font-[family-name:var(--font-vt323)] text-sm text-primary hover:text-secondary">Already have an account? Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
