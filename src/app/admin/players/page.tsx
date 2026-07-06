"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getPlayers, deletePlayer } from "../actions";

export default function PlayersAdmin() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [players, setPlayers] = useState<Array<{
    id: string; name: string; realName: string; role: string;
    game: string; rating: number; champion: string | null;
  }>>([]);

  useEffect(() => {
    getPlayers().then((data) => setPlayers(Array.isArray(data) ? data : []));
  }, []);

  const filtered = players.filter((p) => {
    if (filter !== "all" && p.game !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete player "${name}"? This cannot be undone.`)) return;
    await deletePlayer(id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green">PLAYERS</h1>
        <Link href="/admin/players/new" className="retro-btn retro-btn-primary text-[8px]">+ NEW PLAYER</Link>
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
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">PLAYER</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden sm:table-cell">ROLE</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden md:table-cell">GAME</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden md:table-cell">MMR</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden lg:table-cell">CHAMPION</th>
                <th className="text-right py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-surface-hover border-2 border-border flex items-center justify-center">
                        <span className="font-[family-name:var(--font-press-start)] text-[8px] text-primary">{p.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text">{p.name}</p>
                        <p className="text-[10px] text-text-muted">{p.realName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell text-xs text-text-muted">{p.role}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="font-[family-name:var(--font-press-start)] text-[7px] text-primary">{p.game.toUpperCase()}</span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="font-[family-name:var(--font-press-start)] text-[9px] text-secondary">{p.rating}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-xs text-text-muted">{p.champion || "-"}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/players/${p.id}`}
                        className="px-3 py-2 border-2 border-primary text-primary font-[family-name:var(--font-press-start)] text-[7px] hover:bg-primary hover:text-background min-h-[44px] flex items-center">EDIT</Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
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
