"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllUsers, getUserStats, deleteUser, toggleBanUser, createUser } from "./actions";

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

const GAME_LABELS: Record<string, string> = {
  freefire: "Free Fire",
  pubg: "PUBG",
  cod: "Call of Duty",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0, banned: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", game: "freefire" });

  useEffect(() => {
    Promise.all([getAllUsers(), getUserStats()]).then(([u, s]) => {
      setUsers(u);
      setStats(s);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this user?")) return;
    await deleteUser(id);
    setUsers(users.filter((u) => u.id !== id));
    setStats({ ...stats, total: stats.total - 1 });
  }

  async function handleToggleBan(id: string) {
    const result = await toggleBanUser(id);
    if (result.success) {
      setUsers(users.map((u) => (u.id === id ? { ...u, isBanned: result.isBanned } : u)));
      setStats({
        ...stats,
        banned: result.isBanned ? stats.banned + 1 : stats.banned - 1,
        active: result.isBanned ? stats.active - 1 : stats.active + 1,
      });
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const result = await createUser(form);
    if (result.success) {
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", game: "freefire" });
      const [u, s] = await Promise.all([getAllUsers(), getUserStats()]);
      setUsers(u);
      setStats(s);
    } else {
      alert(result.error);
    }
    setCreating(false);
  }

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchGame = gameFilter === "all" || u.game === gameFilter;
    return matchSearch && matchGame;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="scanline-overlay font-[family-name:var(--font-press-start)] text-xs text-primary animate-pulse">
          LOADING USERS...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green">
          USER MANAGEMENT
        </h1>
        <button onClick={() => setShowCreate(true)} className="retro-btn retro-btn-primary">
          + NEW USER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "TOTAL USERS", value: stats.total, color: "text-primary" },
          { label: "ACTIVE", value: stats.active, color: "text-success" },
          { label: "BANNED", value: stats.banned, color: "text-danger" },
        ].map((stat) => (
          <div key={stat.label} className="pixel-card p-4 border-border text-center">
            <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-2">{stat.label}</p>
            <p className={`font-[family-name:var(--font-press-start)] text-xl ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="pixel-card p-4 border-border mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
          />
          <select
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
            className="bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
          >
            <option value="all">All Games</option>
            <option value="freefire">Free Fire</option>
            <option value="pubg">PUBG</option>
            <option value="cod">Call of Duty</option>
          </select>
        </div>
      </div>

      <div className="pixel-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-3 border-border">
              <th className="text-left p-3 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">USER</th>
              <th className="text-left p-3 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted hidden sm:table-cell">GAME</th>
              <th className="text-left p-3 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted hidden md:table-cell">JOINED</th>
              <th className="text-center p-3 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">STATUS</th>
              <th className="text-right p-3 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 border-2 border-primary flex items-center justify-center shrink-0">
                      <span className="font-[family-name:var(--font-press-start)] text-[8px] text-primary">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text truncate">{user.name}</p>
                      <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <span className="font-[family-name:var(--font-vt323)] text-sm text-text-muted">
                    {GAME_LABELS[user.game] || user.game}
                  </span>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <span className="font-[family-name:var(--font-vt323)] text-sm text-text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span className={`inline-block px-2 py-1 border font-[family-name:var(--font-press-start)] text-[7px] ${
                    user.isBanned
                      ? "border-danger text-danger bg-danger/10"
                      : "border-success text-success bg-success/10"
                  }`}>
                    {user.isBanned ? "BANNED" : "ACTIVE"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="text-primary hover:text-secondary transition-colors font-[family-name:var(--font-press-start)] text-[7px] px-2 py-1.5 min-h-[44px] flex items-center"
                    >
                      VIEW
                    </button>
                    <button
                      onClick={() => handleToggleBan(user.id)}
                      className={`font-[family-name:var(--font-press-start)] text-[7px] px-2 py-1.5 min-h-[44px] flex items-center transition-colors ${
                        user.isBanned ? "text-success hover:text-primary" : "text-warning hover:text-danger"
                      }`}
                    >
                      {user.isBanned ? "UNBAN" : "BAN"}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-danger hover:text-secondary transition-colors font-[family-name:var(--font-press-start)] text-[7px] px-2 py-1.5 min-h-[44px] flex items-center"
                    >
                      DEL
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="font-[family-name:var(--font-press-start)] text-xs text-text-muted">No users found</p>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4">
          <div className="pixel-card p-6 border-primary w-full max-w-md">
            <h2 className="font-[family-name:var(--font-press-start)] text-xs text-primary mb-6">CREATE USER</h2>
            <form onSubmit={handleCreate} className="space-y-4">
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
                <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-text-muted mb-1">PASSWORD</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                  required
                  minLength={6}
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
              <div className="flex gap-3">
                <button type="submit" disabled={creating} className="retro-btn retro-btn-primary flex-1">
                  {creating ? "CREATING..." : "CREATE"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="retro-btn retro-btn-secondary flex-1">
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
