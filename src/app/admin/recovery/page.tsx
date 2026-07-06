"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyRecoveryKey, adminResetPassword } from "../actions";

export default function AdminRecoveryPage() {
  const router = useRouter();

  const [step, setStep] = useState<"key" | "reset">("key");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleVerifyKey(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await verifyRecoveryKey(recoveryKey);
    if (result.success) {
      setStep("reset");
    } else {
      setError(result.error || "Invalid key");
    }
    setLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password must contain uppercase, lowercase, and number");
      setLoading(false);
      return;
    }

    const result = await adminResetPassword(newPassword);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/admin"), 2000);
    } else {
      setError(result.error || "Failed to reset");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="pixel-card p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-danger/20 border-[3px] border-danger flex items-center justify-center">
              <span className="font-[family-name:var(--font-press-start)] text-xl text-danger">!</span>
            </div>
            <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green mb-2">
              ADMIN RECOVERY
            </h1>
            <p className="font-[family-name:var(--font-vt323)] text-lg text-text-muted">
              {step === "key" ? "Enter your recovery key" : "Set a new password"}
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="bg-primary/10 border-2 border-primary p-4">
                <p className="font-[family-name:var(--font-press-start)] text-[9px] text-primary">RESET COMPLETE!</p>
              </div>
            </div>
          ) : step === "key" ? (
            <form onSubmit={handleVerifyKey}>
              {error && (
                <div className="bg-danger/10 border-2 border-danger p-3 mb-4">
                  <p className="font-[family-name:var(--font-press-start)] text-[8px] text-danger">{error}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">RECOVERY KEY</label>
                <input
                  type="password"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  placeholder="Enter your recovery key"
                  className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                  required
                />
              </div>

              <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted mb-4">
                Found in your .env file as ADMIN_RECOVERY_KEY
              </p>

              <button type="submit" disabled={loading} className="retro-btn retro-btn-primary w-full">
                {loading ? "VERIFYING..." : "VERIFY KEY"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              {error && (
                <div className="bg-danger/10 border-2 border-danger p-3 mb-4">
                  <p className="font-[family-name:var(--font-press-start)] text-[8px] text-danger">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">NEW PASSWORD</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="retro-btn retro-btn-primary w-full mt-4">
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => router.push("/admin/login")} className="font-[family-name:var(--font-vt323)] text-sm text-text-muted hover:text-primary">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
