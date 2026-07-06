"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getMatches, deleteMatch, getTeams } from "../actions";

const GAME_LABELS: Record<string, string> = { freefire: "FREE FIRE", pubg: "PUBG", cod: "CALL OF DUTY" };

export default function MatchesAdmin() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [matches, setMatches] = useState<Array<{
    id: string; tournamentId: string; tournamentName: string; game: string;
    team1: string; team2: string; team1Score: number | null; team2Score: number | null;
    status: string; date: string; time: string;
  }>>([]);
  const [teamMap, setTeamMap] = useState<Record<string, { name: string; tag: string }>>({});

  useEffect(() => {
    Promise.all([getMatches(), getTeams()]).then(([m, t]) => {
      setMatches(Array.isArray(m) ? m : []);
      setTeamMap(Array.isArray(t) ? Object.fromEntries(t.map((team) => [team.id, { name: team.name, tag: team.tag }])) : {});
    });
  }, []);

  const filtered = matches.filter((m) => {
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (gameFilter !== "all" && m.game !== gameFilter) return false;
    if (search) {
      const t1 = teamMap[m.team1]?.name || m.team1;
      const t2 = teamMap[m.team2]?.name || m.team2;
      if (!t1.toLowerCase().includes(search.toLowerCase()) && !t2.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match? This cannot be undone.")) return;
    await deleteMatch(id);
    setMatches((prev) => prev.filter((m) => m.id !== id));
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green">MATCHES</h1>
        <Link href="/admin/matches/new" className="retro-btn retro-btn-primary text-[8px]">+ NEW MATCH</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="SEARCH TEAMS..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-press-start)] text-[8px] focus:outline-none focus:border-primary" />
        <div className="flex flex-wrap gap-2">
          {["all", "scheduled", "live", "completed"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2 py-1 border-2 font-[family-name:var(--font-press-start)] text-[7px] ${
                statusFilter === s ? "bg-primary text-background border-primary" : "border-border text-text-muted"
              }`}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "freefire", "pubg", "cod"].map((g) => (
            <button key={g} onClick={() => setGameFilter(g)}
              className={`px-2 py-1 border-2 font-[family-name:var(--font-press-start)] text-[7px] ${
                gameFilter === g ? "bg-secondary text-background border-secondary" : "border-border text-text-muted"
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
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">MATCH</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden sm:table-cell">GAME</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">SCORE</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden md:table-cell">DATE</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">STATUS</th>
                <th className="text-right py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text">
                      {teamMap[m.team1]?.tag || m.team1} vs {teamMap[m.team2]?.tag || m.team2}
                    </p>
                    <p className="text-[10px] text-text-muted">{m.tournamentName}</p>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="font-[family-name:var(--font-press-start)] text-[7px] text-primary">{GAME_LABELS[m.game]}</span>
                  </td>
                  <td className="py-3 px-4">
                    {m.status === "completed" ? (
                      <span className="font-[family-name:var(--font-press-start)] text-[9px]">
                        <span className="text-primary">{m.team1Score}</span>
                        <span className="text-text-muted">:</span>
                        <span className="text-accent">{m.team2Score}</span>
                      </span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-xs text-text-muted">
                    {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 border text-[7px] font-[family-name:var(--font-press-start)] ${
                      m.status === "completed" ? "border-border text-text-muted" :
                      m.status === "live" ? "border-accent text-accent" :
                      "border-primary text-primary"
                    }`}>
                      {m.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/matches/${m.id}`}
                        className="px-3 py-2 border-2 border-primary text-primary font-[family-name:var(--font-press-start)] text-[7px] hover:bg-primary hover:text-background min-h-[44px] flex items-center">EDIT</Link>
                      <button
                        onClick={() => handleDelete(m.id)}
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
