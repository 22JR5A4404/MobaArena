"use client";

import { useState, useEffect } from "react";
import { getMessages, markMessageRead, deleteMessage, createResetToken } from "../actions";

interface Message {
  id: string;
  userId: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
  user: { name: string; email: string };
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetLink, setResetLink] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getMessages().then((msgs) => {
      setMessages(msgs.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })));
      setLoading(false);
    });
  }, []);

  async function handleMarkRead(id: string) {
    await markMessageRead(id);
    setMessages(messages.map((m) => m.id === id ? { ...m, read: true } : m));
  }

  async function handleDelete(id: string) {
    await deleteMessage(id);
    setMessages(messages.filter((m) => m.id !== id));
  }

  async function handleSendReset(email: string) {
    setResetEmail(email);
    setShowResetModal(true);
    setCopied(false);
    setResetLink("");
  }

  async function generateResetLink() {
    const result = await createResetToken(resetEmail, "password");
    if (result.success && result.token) {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setResetLink(`${origin}/reset/${result.token}`);
    }
    setShowResetModal(true);
  }

  function copyLink() {
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-[family-name:var(--font-press-start)] text-xs text-primary animate-pulse">LOADING...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary mb-6 crt-glow-green">
        MESSAGES
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="pixel-card p-4 border-border text-center">
          <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-1">TOTAL</p>
          <p className="font-[family-name:var(--font-press-start)] text-lg text-primary">{messages.length}</p>
        </div>
        <div className="pixel-card p-4 border-border text-center">
          <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-1">UNREAD</p>
          <p className="font-[family-name:var(--font-press-start)] text-lg text-secondary">{messages.filter((m) => !m.read).length}</p>
        </div>
        <div className="pixel-card p-4 border-border text-center">
          <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-1">RESET REQUESTS</p>
          <p className="font-[family-name:var(--font-press-start)] text-lg text-accent">
            {messages.filter((m) => m.subject === "password-reset").length}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="pixel-card p-8 border-border text-center">
          <p className="font-[family-name:var(--font-press-start)] text-[9px] text-text-muted">NO MESSAGES</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`pixel-card p-4 border-2 ${msg.read ? "border-border" : "border-primary"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`font-[family-name:var(--font-press-start)] text-[7px] px-2 py-0.5 border ${
                      msg.subject === "password-reset" ? "border-secondary text-secondary" :
                      "border-text-muted text-text-muted"
                    }`}>
                      {msg.subject === "password-reset" ? "PASSWORD RESET" : msg.subject.toUpperCase()}
                    </span>
                    {!msg.read && <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                  </div>
                  <p className="font-[family-name:var(--font-vt323)] text-sm text-text-muted mb-1">
                    From: <span className="text-text">{msg.user.name}</span> ({msg.user.email})
                  </p>
                  <p className="font-[family-name:var(--font-vt323)] text-sm text-text">{msg.message}</p>
                  <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted mt-2">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {msg.subject === "password-reset" && (
                    <button
                      onClick={() => handleSendReset(msg.user.email)}
                      className="retro-btn retro-btn-primary text-[7px]"
                    >
                      SEND RESET LINK
                    </button>
                  )}
                  {!msg.read && (
                    <button
                      onClick={() => handleMarkRead(msg.id)}
                      className="retro-btn retro-btn-secondary text-[7px]"
                    >
                      MARK READ
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="retro-btn retro-btn-danger text-[7px]"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="pixel-card p-6 w-full max-w-md border-primary">
            <h2 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary mb-4">
              SEND RESET LINK
            </h2>
            <p className="font-[family-name:var(--font-vt323)] text-sm text-text-muted mb-4">
              Email: <span className="text-text">{resetEmail}</span><br />
              Type: <span className="text-primary">Password Reset</span>
            </p>

            {!resetLink ? (
              <div className="flex gap-3">
                <button onClick={() => setShowResetModal(false)} className="retro-btn retro-btn-secondary flex-1">
                  CANCEL
                </button>
                <button onClick={generateResetLink} className="retro-btn retro-btn-primary flex-1">
                  GENERATE LINK
                </button>
              </div>
            ) : (
              <div>
                <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted mb-2">Reset link (expires in 10 min):</p>
                <div className="bg-surface border-2 border-border p-3 mb-4 break-all">
                  <code className="font-[family-name:var(--font-vt323)] text-xs text-primary">{resetLink}</code>
                </div>
                <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted mb-3">
                  Copy this link and send it to the user via email.
                </p>
                <div className="flex gap-3">
                  <button onClick={copyLink} className="retro-btn retro-btn-secondary flex-1">
                    {copied ? "COPIED!" : "COPY LINK"}
                  </button>
                  <button onClick={() => { setShowResetModal(false); setResetLink(""); }} className="retro-btn retro-btn-primary flex-1">
                    DONE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
