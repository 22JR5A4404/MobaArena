"use client";

import { useState } from "react";
import Link from "next/link";
import { sendMessage } from "../actions";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await sendMessage({ subject, message, email });
    if (result.success) {
      setSuccess("Message sent to admin! They will get back to you.");
      setEmail("");
      setSubject("");
      setMessage("");
    } else {
      setError(result.error || "Failed to send");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-press-start)] text-xl text-primary crt-glow-green mb-2">
            CONTACT ADMIN
          </h1>
          <p className="font-[family-name:var(--font-vt323)] text-lg text-text-muted">
            Need a password reset?
          </p>
        </div>

        <div className="pixel-card p-6 border-primary">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-danger/10 border-2 border-danger p-3 font-[family-name:var(--font-vt323)] text-sm text-danger">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-success/10 border-2 border-success p-3 font-[family-name:var(--font-vt323)] text-sm text-success">
                {success}
              </div>
            )}

            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">YOUR EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                required
              />
            </div>

            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">SUBJECT</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                required
              >
                <option value="">Select reason...</option>
                <option value="password-reset">Forgot Password</option>
              </select>
            </div>

            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">MESSAGE</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Describe your issue..."
                className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none resize-none"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="retro-btn retro-btn-primary w-full">
              {loading ? "SENDING..." : "SEND MESSAGE"}
            </button>
          </form>

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
