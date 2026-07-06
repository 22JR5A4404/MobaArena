"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getTeams, deleteTeam } from "../actions";

const GAME_LABELS: Record<string, string> = { freefire: "FREE FIRE", pubg: "PUBG", cod: "CALL OF DUTY" };

export default function TeamsAdmin() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [teams, setTeams] = useState<Array<{
    id: string; name: string; tag: string; logo: string; game: string;
    region: string; rating: number; wins: number; losses: number; color: string;
  }>>([]);

  useEffect(() => {
    getTeams().then((data) => setTeams(Array.isArray(data) ? data : []));
  }, []);

  const filtered = teams.filter((t) => {
    if (filter !== "all" && t.game !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.tag.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete team "${name}"? This cannot be undone.`)) return;
    await deleteTeam(id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green">TEAMS</h1>
        <Link href="/admin/teams/new" className="retro-btn retro-btn-primary text-[8px]">+ NEW TEAM</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="SEARCH..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-press-start)] text-[8px] focus:outline-none focus:border-primary" />
        <div className="flex flex-wrap gap-2">
          {["all", "freefire", "pubg", "cod"].map((g) => (
            <button key={g} onClick={() => setFilter(g)}
              className={`px-2 py-1 border-2 font-[family-name:var(--font-press-start)] text-[7px] ${
                filter === g ? "bg-primary text-background border-primary" : "border-border text-text-muted"
              }`}>
              {g === "all" ? "ALL" : g.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="pixel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-3 border-border bg-surface-hover">
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">TEAM</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden sm:table-cell">GAME</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden md:table-cell">REGION</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden md:table-cell">MMR</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden md:table-cell">RECORD</th>
                <th className="text-right py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 border-2 border-border flex items-center justify-center" style={{ background: `${t.color}20` }}>
                        <span className="font-[family-name:var(--font-press-start)] text-[7px]" style={{ color: t.color }}>{t.tag}</span>
                      </div>
                      <span className="font-[family-name:var(--font-press-start)] text-[8px] text-text">{t.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="font-[family-name:var(--font-press-start)] text-[7px] text-primary">{GAME_LABELS[t.game]}</span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-sm text-text-muted">{t.region}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="font-[family-name:var(--font-press-start)] text-[9px] text-secondary">{t.rating}</span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-sm">
                    <span className="text-success">{t.wins}W</span> <span className="text-accent">{t.losses}L</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/teams/${t.id}`}
                        className="px-3 py-2 border-2 border-primary text-primary font-[family-name:var(--font-press-start)] text-[7px] hover:bg-primary hover:text-background min-h-[44px] flex items-center">EDIT</Link>
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        className="px-3 py-2 border-2 border-accent text-accent font-[family-name:var(--font-press-start)] text-[7px] hover:bg-accent hover:text-background min-h-[44px] flex items-center"
                      >DEL</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
