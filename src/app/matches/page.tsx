"use client";

import { useState, useEffect } from "react";
import { getPublicMatches } from "../actions";
import MatchCard from "@/components/Mc2p";
import SectionHeader from "@/components/Sh6w";
import { Match, Game } from "@/types/t0";

const STATUSES = [
  { value: "all", label: "ALL" },
  { value: "scheduled", label: "SCHEDULED" },
  { value: "live", label: "LIVE" },
  { value: "completed", label: "COMPLETED" },
];

const GAMES: { value: Game | "all"; label: string }[] = [
  { value: "all", label: "ALL GAMES" },
  { value: "freefire", label: "Free Fire" },
  { value: "pubg", label: "PUBG" },
  { value: "cod", label: "Call of Duty" },
];

export default function MatchesPage() {
  const [status, setStatus] = useState("all");
  const [game, setGame] = useState<string>("all");
  const [allMatches, setAllMatches] = useState<Match[]>([]);

  useEffect(() => {
    getPublicMatches().then((data) => {
      setAllMatches(data as Match[]);
    });
  }, []);

  const filtered = allMatches.filter((m) => {
    if (status !== "all" && m.status !== status) return false;
    if (game !== "all" && m.game !== game) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader title="MATCHES" subtitle="View scheduled and completed match results" />

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-2 border-2 font-[family-name:var(--font-press-start)] text-[8px] transition-all ${
                status === s.value
                  ? "bg-primary text-background border-primary"
                  : "bg-transparent border-border text-text-muted hover:text-primary hover:border-primary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {GAMES.map((g) => (
            <button
              key={g.value}
              onClick={() => setGame(g.value)}
              className={`px-3 py-2 border-2 font-[family-name:var(--font-press-start)] text-[8px] transition-all ${
                game === g.value
                  ? "bg-secondary text-background border-secondary"
                  : "bg-transparent border-border text-text-muted hover:text-secondary hover:border-secondary"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m as Match} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 pixel-card">
          <p className="font-[family-name:var(--font-press-start)] text-sm text-text-muted">NO MATCHES FOUND</p>
        </div>
      )}
    </div>
  );
}
