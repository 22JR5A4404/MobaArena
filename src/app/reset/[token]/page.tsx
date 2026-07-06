"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { verifyResetToken, resetPassword } from "../actions";

export default function ResetPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    verifyResetToken(token).then((result) => {
      setTokenValid(result.valid);
    });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); setLoading(false); return; }

    const result = await resetPassword(token, newPassword);
    if (result.success) { setSuccess(true); setTimeout(() => router.push("/user/login"), 2000); }
    else setError(result.error || "Failed to reset");
    setLoading(false);
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-[family-name:var(--font-press-start)] text-xs text-primary animate-pulse">VERIFYING LINK...</p>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="pixel-card p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-danger/20 border-[3px] border-danger flex items-center justify-center">
            <span className="font-[family-name:var(--font-press-start)] text-xl text-danger">X</span>
          </div>
          <h1 className="font-[family-name:var(--font-press-start)] text-sm text-danger mb-2">LINK EXPIRED</h1>
          <p className="font-[family-name:var(--font-vt323)] text-lg text-text-muted mb-6">This reset link has expired or already been used. Contact admin for a new one.</p>
          <button onClick={() => router.push("/user/login")} className="retro-btn retro-btn-primary">BACK TO LOGIN</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="pixel-card p-6 sm:p-8">
          <div className="text-center mb-4">
            <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green mb-2">
              RESET PASSWORD
            </h1>
            <p className="font-[family-name:var(--font-vt323)] text-base text-text-muted">
              Set a new password
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="bg-primary/10 border-2 border-primary p-4">
                <p className="font-[family-name:var(--font-press-start)] text-[9px] text-primary">RESET COMPLETE!</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-danger/10 border-2 border-danger p-3 mb-3">
                  <p className="font-[family-name:var(--font-press-start)] text-[8px] text-danger">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">NEW PASSWORD</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]" required />
                </div>
                <div>
                  <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">CONFIRM PASSWORD</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]" required />
                </div>
              </div>

              <div className="mt-6">
                <button type="submit" disabled={loading} className="retro-btn retro-btn-primary w-full">
                  {loading ? "SAVING..." : "RESET PASSWORD"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
