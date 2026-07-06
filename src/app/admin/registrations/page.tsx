"use client";

import { useState, useEffect } from "react";
import { getAllRegistrations, getRegistrationStats, updateRegistrationStatus, deleteRegistration } from "./actions";

const GAME_LABELS: Record<string, string> = {
  freefire: "Free Fire",
  pubg: "PUBG",
  cod: "Call of Duty",
};

const STATUS_OPTIONS = ["pending", "confirmed", "rejected", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  pending: "border-warning text-warning bg-warning/10",
  confirmed: "border-success text-success bg-success/10",
  rejected: "border-danger text-danger bg-danger/10",
  cancelled: "border-text-muted text-text-muted bg-text-muted/10",
};

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<{
    id: string;
    tournamentId: string;
    tournamentName: string;
    tournamentGame: string;
    tournamentStatus: string;
    userId: string;
    userName: string;
    userEmail: string;
    teamName: string;
    teamTag: string;
    teamColor: string;
    playerName: string;
    playerEmail: string;
    gameName: string;
    status: string;
    createdAt: string;
  }[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    Promise.all([getAllRegistrations(), getRegistrationStats()]).then(([r, s]) => {
      setRegistrations(r);
      setStats(s);
      setLoading(false);
    });
  }, []);

  async function handleStatusChange(id: string, newStatus: string) {
    const result = await updateRegistrationStatus(id, newStatus);
    if (result.success) {
      setRegistrations(registrations.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      const s = await getRegistrationStats();
      setStats(s);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this registration?")) return;
    const result = await deleteRegistration(id);
    if (result.success) {
      setRegistrations(registrations.filter((r) => r.id !== id));
      const s = await getRegistrationStats();
      setStats(s);
    }
  }

  const filtered = registrations.filter((r) => {
    const matchSearch = !search ||
      r.tournamentName.toLowerCase().includes(search.toLowerCase()) ||
      r.playerName.toLowerCase().includes(search.toLowerCase()) ||
      r.teamName.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="scanline-overlay font-[family-name:var(--font-press-start)] text-xs text-primary animate-pulse">
          LOADING REGISTRATIONS...
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green mb-8">
        REGISTRATIONS
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "TOTAL", value: stats.total, color: "text-primary" },
          { label: "PENDING", value: stats.pending, color: "text-warning" },
          { label: "CONFIRMED", value: stats.confirmed, color: "text-success" },
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
            placeholder="Search tournaments, players, teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-surface-hover border-2 border-border px-3 py-2 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-hover border-2 border-border px-3 py-2 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pixel-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-3 border-border">
              <th className="text-left p-3 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">PLAYER</th>
              <th className="text-left p-3 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted hidden sm:table-cell">TOURNAMENT</th>
              <th className="text-left p-3 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted hidden md:table-cell">TEAM</th>
              <th className="text-center p-3 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">STATUS</th>
              <th className="text-right p-3 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((reg) => (
              <tr key={reg.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                <td className="p-3">
                  <div>
                    <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text">{reg.playerName}</p>
                    <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted">{reg.userEmail}</p>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <div>
                    <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text truncate max-w-[200px]">{reg.tournamentName}</p>
                    <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted">{GAME_LABELS[reg.tournamentGame] || reg.tournamentGame}</p>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  {reg.teamName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-border flex items-center justify-center" style={{ background: `${reg.teamColor}20` }}>
                        <span className="font-[family-name:var(--font-press-start)] text-[5px]" style={{ color: reg.teamColor }}>{reg.teamTag || "?"}</span>
                      </div>
                      <span className="font-[family-name:var(--font-vt323)] text-sm text-text-muted">{reg.teamName}</span>
                    </div>
                  ) : (
                    <span className="font-[family-name:var(--font-vt323)] text-xs text-text-muted italic">Solo</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <select
                    value={reg.status}
                    onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                    className={`px-3 py-2 border-2 font-[family-name:var(--font-press-start)] text-[7px] bg-transparent cursor-pointer min-h-[44px] ${STATUS_COLORS[reg.status] || STATUS_COLORS.pending}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(reg.id)}
                    className="text-danger hover:text-secondary transition-colors font-[family-name:var(--font-press-start)] text-[7px] px-2 py-1.5 min-h-[44px] flex items-center"
                  >
                    DEL
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="font-[family-name:var(--font-press-start)] text-xs text-text-muted">No registrations found</p>
        </div>
      )}
    </div>
  );
}
