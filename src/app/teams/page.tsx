"use client";

import { useState, useEffect } from "react";
import { getPublicTeams } from "../actions";
import TeamCard from "@/components/Tm9l";
import SectionHeader from "@/components/Sh6w";
import { Team, Game } from "@/types/t0";

const GAMES: { value: Game | "all"; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "freefire", label: "Free Fire" },
  { value: "pubg", label: "PUBG" },
  { value: "cod", label: "Call of Duty" },
];

export default function TeamsPage() {
  const [game, setGame] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [allTeams, setAllTeams] = useState<Team[]>([]);

  useEffect(() => {
    getPublicTeams().then((data) => {
      setAllTeams(data.map((t) => ({
        ...t,
        game: t.game as Game,
        players: JSON.parse(t.players || "[]"),
      })));
    });
  }, []);

  const filtered = allTeams.filter((t) => {
    if (game !== "all" && t.game !== game) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.tag.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader title="TEAMS" subtitle="Discover top MOBA teams" />

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="SEARCH TEAMS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-press-start)] text-[9px] focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
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

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((t) => (
            <TeamCard key={t.id} team={t as Team} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 pixel-card">
          <p className="font-[family-name:var(--font-press-start)] text-sm text-text-muted">NO TEAMS FOUND</p>
        </div>
      )}
    </div>
  );
}
