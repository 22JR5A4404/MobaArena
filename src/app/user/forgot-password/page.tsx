"use client";

import Link from "next/link";
import { useState } from "react";
import { resetPassword } from "../actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const result = await resetPassword({ email, newPassword });
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Reset failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-press-start)] text-xl text-primary crt-glow-green mb-2">
            RESET PASSWORD
          </h1>
          <p className="font-[family-name:var(--font-vt323)] text-lg text-text-muted">
            Enter your email and set a new password
          </p>
        </div>

        <div className="pixel-card p-6 border-primary">
          {success ? (
            <div className="text-center space-y-4">
              <div className="bg-primary/10 border-2 border-primary p-4">
                <p className="font-[family-name:var(--font-press-start)] text-[9px] text-primary mb-2">PASSWORD RESET!</p>
                <p className="font-[family-name:var(--font-vt323)] text-sm text-text-muted">
                  Your password has been updated successfully.
                </p>
              </div>
              <Link
                href="/user/login"
                className="retro-btn retro-btn-primary inline-block"
              >
                BACK TO LOGIN
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-danger/10 border-2 border-danger p-3 font-[family-name:var(--font-vt323)] text-sm text-danger">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                  required
                />
              </div>

              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                  minLength={8}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="retro-btn retro-btn-primary w-full"
              >
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link
              href="/user/login"
              className="font-[family-name:var(--font-vt323)] text-sm text-primary hover:text-secondary"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
