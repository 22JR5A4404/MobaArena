"use client";

import { useState, useEffect } from "react";
import { getPublicPlayers } from "../actions";
import PlayerCard from "@/components/Pc5n";
import SectionHeader from "@/components/Sh6w";
import { Player, Game } from "@/types/t0";

const GAMES: { value: Game | "all"; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "freefire", label: "Free Fire" },
  { value: "pubg", label: "PUBG" },
  { value: "cod", label: "Call of Duty" },
];

const ROLES = [
  "ALL ROLES",
  "Mid Laner",
  "ADC",
  "Top Laner",
  "Jungler",
  "Support",
  "Carry",
  "Offlaner",
];

export default function PlayersPage() {
  const [game, setGame] = useState<string>("all");
  const [role, setRole] = useState("ALL ROLES");
  const [search, setSearch] = useState("");
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  useEffect(() => {
    getPublicPlayers().then((data) => {
      setAllPlayers(data.map((p) => ({
        ...p,
        game: p.game as Game,
        champion: p.champion ?? undefined,
        stats: JSON.parse(p.stats || "{}"),
      })));
    });
  }, []);

  const filtered = allPlayers.filter((p) => {
    if (game !== "all" && p.game !== game) return false;
    if (role !== "ALL ROLES" && p.role !== role) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader title="PLAYERS" subtitle="Top MOBA players across all games" />

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="SEARCH PLAYERS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-press-start)] text-[9px] focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {GAMES.map((g) => (
            <button
              key={g.value}
              onClick={() => setGame(g.value)}
              className={`px-3 py-2 border-2 font-[family-name:var(--font-press-start)] text-[8px] transition-all ${
                game === g.value
                  ? "bg-primary text-background border-primary"
                  : "bg-transparent border-border text-text-muted hover:text-primary hover:border-primary"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 border-2 border-border bg-surface text-text-muted font-[family-name:var(--font-press-start)] text-[8px] focus:outline-none focus:border-primary"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <PlayerCard key={p.id} player={p as Player} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 pixel-card">
          <p className="font-[family-name:var(--font-press-start)] text-sm text-text-muted">NO PLAYERS FOUND</p>
        </div>
      )}
    </div>
  );
}
