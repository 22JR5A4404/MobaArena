"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getTournaments, deleteTournament } from "../actions";

const GAME_LABELS: Record<string, string> = { freefire: "FREE FIRE", pubg: "PUBG", cod: "CALL OF DUTY" };

export default function TournamentsAdmin() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [tournaments, setTournaments] = useState<Array<{
    id: string; name: string; game: string; status: string;
    registeredTeams: number; maxTeams: number; prizePool: string; organizer: string;
  }>>([]);

  useEffect(() => {
    getTournaments().then((data) => setTournaments(Array.isArray(data) ? data : []));
  }, []);

  const filtered = tournaments.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteTournament(id);
    setTournaments((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green">TOURNAMENTS</h1>
        <Link href="/admin/tournaments/new" className="retro-btn retro-btn-primary text-[8px]">
          + NEW TOURNAMENT
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="SEARCH..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-press-start)] text-[8px] focus:outline-none focus:border-primary"
        />
        <div className="flex flex-wrap gap-2">
          {["all", "ongoing", "registration", "upcoming", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2 py-1 border-2 font-[family-name:var(--font-press-start)] text-[7px] ${
                filter === s ? "bg-primary text-background border-primary" : "border-border text-text-muted"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="pixel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-3 border-border bg-surface-hover">
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">NAME</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden sm:table-cell">GAME</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">STATUS</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden md:table-cell">TEAMS</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden md:table-cell">PRIZE</th>
                <th className="text-right py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.organizer}</p>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="font-[family-name:var(--font-press-start)] text-[7px] text-primary">{GAME_LABELS[t.game]}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 border text-[7px] font-[family-name:var(--font-press-start)] ${
                      t.status === "ongoing" ? "border-accent text-accent" :
                      t.status === "registration" ? "border-primary text-primary" :
                      t.status === "upcoming" ? "border-secondary text-secondary" :
                      "border-border text-text-muted"
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="text-sm text-text">{t.registeredTeams}/{t.maxTeams}</span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="text-sm text-primary">{t.prizePool}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/tournaments/${t.id}`}
                        className="px-3 py-2 border-2 border-primary text-primary font-[family-name:var(--font-press-start)] text-[7px] hover:bg-primary hover:text-background min-h-[44px] flex items-center"
                      >
                        EDIT
                      </Link>
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        className="px-3 py-2 border-2 border-accent text-accent font-[family-name:var(--font-press-start)] text-[7px] hover:bg-accent hover:text-background min-h-[44px] flex items-center"
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
    </div>
  );
}
