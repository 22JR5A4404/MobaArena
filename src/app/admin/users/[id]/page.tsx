"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getUserById, updateUser, deleteUser } from "../actions";

interface User {
  id: string;
  email: string;
  name: string;
  game: string;
  bio: string;
  favoriteGame: string;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", game: "", bio: "", favoriteGame: "", isBanned: false });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getUserById(params.id as string).then((u) => {
      if (!u) { router.push("/admin/users"); return; }
      setUser(u);
      setForm({ name: u.name, email: u.email, game: u.game, bio: u.bio, favoriteGame: u.favoriteGame, isBanned: u.isBanned });
      setLoading(false);
    });
  }, [params.id, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const result = await updateUser(user!.id, form);
    if (result.success) {
      setMsg("User updated!");
      setUser({ ...user!, ...form });
    } else {
      setMsg(result.error || "Failed to save");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this user?")) return;
    await deleteUser(user!.id);
    router.push("/admin/users");
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="scanline-overlay font-[family-name:var(--font-press-start)] text-xs text-primary animate-pulse">
          LOADING...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/users" className="text-primary hover:text-secondary font-[family-name:var(--font-press-start)] text-[8px]">
          &lt; USERS
        </Link>
        <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green">
          EDIT USER
        </h1>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-primary/20 border-2 border-primary flex items-center justify-center">
          <span className="font-[family-name:var(--font-press-start)] text-lg text-primary">{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="font-[family-name:var(--font-press-start)] text-xs text-text">{user.name}</p>
          <p className="font-[family-name:var(--font-vt323)] text-sm text-text-muted">{user.email}</p>
          <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted">ID: {user.id}</p>
        </div>
      </div>

      {msg && (
        <div className={`p-3 mb-6 font-[family-name:var(--font-vt323)] text-sm border-2 ${
          msg.includes("Failed") || msg.includes("error")
            ? "bg-danger/10 border-danger text-danger"
            : "bg-success/10 border-success text-success"
        }`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="pixel-card p-6 border-border space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-1">NAME</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
              required
            />
          </div>
          <div>
            <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-1">EMAIL</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
              required
            />
          </div>
          <div>
            <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-1">GAME</label>
            <select
              value={form.game}
              onChange={(e) => setForm({ ...form, game: e.target.value })}
              className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
            >
              <option value="freefire">Free Fire</option>
              <option value="pubg">PUBG</option>
              <option value="cod">Call of Duty</option>
            </select>
          </div>
          <div>
            <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-1">FAVORITE GAME</label>
            <input
              value={form.favoriteGame}
              onChange={(e) => setForm({ ...form, favoriteGame: e.target.value })}
              className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
            />
          </div>
        </div>
        <div>
          <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-1">BIO</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px] resize-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isBanned}
            onChange={(e) => setForm({ ...form, isBanned: e.target.checked })}
            className="w-4 h-4 accent-[#c01020]"
          />
          <label className="font-[family-name:var(--font-press-start)] text-[8px] text-danger">BAN USER</label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="retro-btn retro-btn-primary">
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
          <button type="button" onClick={handleDelete} className="retro-btn retro-btn-danger">
            DELETE USER
          </button>
        </div>
      </form>

      <div className="pixel-card p-4 border-border">
        <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">
          Created: {new Date(user.createdAt).toLocaleString()} &bull; Updated: {new Date(user.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
