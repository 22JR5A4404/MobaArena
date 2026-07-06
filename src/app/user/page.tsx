"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, updateUserProfile, changePassword, logoutUser, getUserRegistrations, cancelRegistration } from "./actions";

const GAME_LABELS: Record<string, string> = {
  freefire: "Free Fire",
  pubg: "PUBG",
  cod: "Call of Duty",
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: "text-text-muted",
  registration: "text-primary",
  ongoing: "text-accent",
  completed: "text-secondary",
};

export default function UserPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name: string;
    game: string;
    bio: string;
    favoriteGame: string;
    isBanned: boolean;
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"profile" | "password" | "registrations">("profile");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [game, setGame] = useState("freefire");
  const [favoriteGame, setFavoriteGame] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [registrations, setRegistrations] = useState<{
    id: string;
    tournamentId: string;
    tournamentName: string;
    tournamentGame: string;
    tournamentStatus: string;
    tournamentPrize: string;
    tournamentEntryFee: string;
    tournamentWhatsapp: string;
    tournamentOrganizer: string;
    teamName: string;
    teamTag: string;
    teamColor: string;
    playerName: string;
    gameName: string;
    status: string;
    createdAt: string;
  }[]>([]);
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        router.push("/user/login");
        return;
      }
      setUser(u);
      setName(u.name);
      setBio(u.bio);
      setGame(u.game);
      setFavoriteGame(u.favoriteGame);
      setLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (tab === "registrations" && user) {
      getUserRegistrations().then(setRegistrations);
    }
  }, [tab, user]);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    const result = await updateUserProfile({ name, bio, game, favoriteGame });
    if (result.success) {
      setMsg("Profile updated!");
      if (result.user) setUser({ ...user!, ...result.user });
    } else {
      setErr(result.error || "Failed to update");
    }
    setSaving(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setErr("Passwords do not match");
      return;
    }
    setSaving(true);
    setMsg("");
    setErr("");
    const result = await changePassword({ currentPassword: currentPw, newPassword: newPw });
    if (result.success) {
      setMsg("Password changed!");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } else {
      setErr(result.error || "Failed to change password");
    }
    setSaving(false);
  }

  async function handleCancelReg(regId: string) {
    setRegLoading(true);
    const result = await cancelRegistration(regId);
    if (result.success) {
      setRegistrations(registrations.filter((r) => r.id !== regId));
      setMsg("Registration cancelled");
    } else {
      setErr(result.error || "Failed to cancel");
    }
    setRegLoading(false);
  }

  async function handleLogout() {
    await logoutUser();
    router.push("/user/login");
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="scanline-overlay font-[family-name:var(--font-press-start)] text-xs text-primary animate-pulse">
          LOADING PROFILE...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green">
          PLAYER PROFILE
        </h1>
        <button onClick={handleLogout} className="retro-btn retro-btn-danger text-[7px]">
          LOGOUT
        </button>
      </div>

      <div className="pixel-card p-6 border-primary mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/20 border-2 border-primary flex items-center justify-center">
            <span className="font-[family-name:var(--font-press-start)] text-lg text-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-[family-name:var(--font-press-start)] text-xs text-text">{user.name}</p>
            <p className="font-[family-name:var(--font-vt323)] text-sm text-text-muted">{user.email}</p>
            <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted">
              Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { key: "profile" as const, label: "PROFILE" },
          { key: "registrations" as const, label: "TOURNAMENTS" },
          { key: "password" as const, label: "PASSWORD" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setMsg(""); setErr(""); }}
            className={`font-[family-name:var(--font-press-start)] text-[8px] px-4 py-2 border-2 transition-all ${
              tab === t.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-text-muted hover:border-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className="bg-success/10 border-2 border-success p-3 mb-4 font-[family-name:var(--font-vt323)] text-sm text-success">
          {msg}
        </div>
      )}
      {err && (
        <div className="bg-danger/10 border-2 border-danger p-3 mb-4 font-[family-name:var(--font-vt323)] text-sm text-danger">
          {err}
        </div>
      )}

      {tab === "profile" && (
        <div className="pixel-card p-6 border-border">
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">NAME</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                required
              />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">BIO</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">GAME</label>
                <select
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                >
                  <option value="freefire">Free Fire</option>
                  <option value="pubg">PUBG</option>
                  <option value="cod">Call of Duty</option>
                </select>
              </div>
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">FAVORITE GAME</label>
                <input
                  value={favoriteGame}
                  onChange={(e) => setFavoriteGame(e.target.value)}
                className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                placeholder="e.g. Free Fire"
                />
              </div>
            </div>
            <button type="submit" disabled={saving} className="retro-btn retro-btn-primary">
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </form>
        </div>
      )}

      {tab === "registrations" && (
        <div>
          {registrations.length === 0 ? (
            <div className="pixel-card p-8 text-center border-border">
              <p className="font-[family-name:var(--font-press-start)] text-[9px] text-text-muted mb-3">NO TOURNAMENTS YET</p>
              <p className="font-[family-name:var(--font-vt323)] text-sm text-text-muted mb-4">Browse open tournaments and register to compete!</p>
              <Link href="/tournaments" className="retro-btn retro-btn-primary inline-block">
                BROWSE TOURNAMENTS
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((reg) => (
                <div key={reg.id} className="pixel-card p-4 border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary/20 border-2 border-primary flex items-center justify-center shrink-0">
                        <span className="font-[family-name:var(--font-press-start)] text-[7px] text-primary">{GAME_LABELS[reg.tournamentGame]?.split(" ").map((w) => w[0]).join("") || "?"}</span>
                      </div>
                      <div className="min-w-0">
                        <Link href={`/tournaments/${reg.tournamentId}`} className="font-[family-name:var(--font-press-start)] text-[8px] text-text hover:text-primary truncate block">
                          {reg.tournamentName}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-[family-name:var(--font-vt323)] text-xs text-text-muted">{GAME_LABELS[reg.tournamentGame] || reg.tournamentGame}</span>
                          <span className={`font-[family-name:var(--font-press-start)] text-[6px] uppercase ${STATUS_COLORS[reg.tournamentStatus] || "text-text-muted"}`}>
                            {reg.tournamentStatus}
                          </span>
                        </div>
                        {reg.teamName && (
                          <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted mt-1">
                            Team: <span className="text-text">{reg.teamName}</span>
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`font-[family-name:var(--font-press-start)] text-[6px] px-1.5 py-0.5 border ${
                            reg.status === "confirmed" ? "border-success text-success" :
                            reg.status === "pending" ? "border-warning text-warning" :
                            "border-danger text-danger"
                          }`}>
                            {reg.status === "confirmed" ? "APPROVED" : reg.status === "pending" ? "PENDING" : "REJECTED"}
                          </span>
                          {reg.status === "pending" && reg.tournamentWhatsapp && (
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://wa.me/${reg.tournamentWhatsapp.replace(/[^0-9]/g, "")}?text=Hi, I registered for ${reg.tournamentName}. My entry is pending.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-[family-name:var(--font-press-start)] text-[6px] text-primary hover:text-secondary"
                              >
                                WHATSAPP ↗
                              </a>
                              <a
                                href={`tel:${reg.tournamentWhatsapp}`}
                                className="font-[family-name:var(--font-press-start)] text-[6px] text-secondary hover:text-primary"
                              >
                                CALL
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {reg.tournamentPrize && (
                        <span className="font-[family-name:var(--font-press-start)] text-[7px] text-primary hidden sm:block">{reg.tournamentPrize}</span>
                      )}
                      {(reg.tournamentStatus === "registration" || reg.tournamentStatus === "upcoming") && (
                        <button
                          onClick={() => handleCancelReg(reg.id)}
                          disabled={regLoading}
                          className="text-danger hover:text-secondary font-[family-name:var(--font-press-start)] text-[7px] transition-colors"
                        >
                          CANCEL
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "password" && (
        <div className="pixel-card p-6 border-border">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">CURRENT PASSWORD</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                required
              />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">NEW PASSWORD</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                required
                minLength={6}
              />
            </div>
            <button type="submit" disabled={saving} className="retro-btn retro-btn-primary">
              {saving ? "CHANGING..." : "CHANGE PASSWORD"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
