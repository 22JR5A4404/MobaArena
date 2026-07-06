"use client";

import { useState, useEffect } from "react";
import tournaments from "@/data/tournaments.json";
import TournamentCard from "@/components/Tc4m";
import SectionHeader from "@/components/Sh6w";
import { Tournament } from "@/types/t0";
import { getPublicTournaments } from "../actions";

const GAMES: { value: string; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "freefire", label: "Free Fire" },
  { value: "pubg", label: "PUBG" },
  { value: "cod", label: "Call of Duty" },
];

const STATUSES = [
  { value: "all", label: "ALL STATUS" },
  { value: "registration", label: "REGISTRATION" },
  { value: "upcoming", label: "UPCOMING" },
  { value: "ongoing", label: "ONGOING" },
  { value: "completed", label: "COMPLETED" },
];

export default function TournamentsPage() {
  const [game, setGame] = useState<string>("all");
  const [status, setStatus] = useState("all");
  const [allTournaments, setAllTournaments] = useState(tournaments);

  useEffect(() => {
    getPublicTournaments().then((data) => {
      if (data.length > 0) setAllTournaments(data.map((t) => ({ ...t, rules: JSON.parse(t.rules || "[]"), bracket: JSON.parse(t.bracket || "{}") })));
    });
  }, []);

  const filtered = allTournaments.filter((t) => {
    if (game !== "all" && t.game !== game) return false;
    if (status !== "all" && t.status !== status) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader title="TOURNAMENTS" subtitle="Browse and compete in MOBA tournaments" />

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border-2 border-border bg-surface text-text-muted font-[family-name:var(--font-press-start)] text-[8px] focus:outline-none focus:border-primary"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <TournamentCard key={t.id} tournament={t as Tournament} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 pixel-card">
          <p className="font-[family-name:var(--font-press-start)] text-sm text-text-muted">NO TOURNAMENTS FOUND</p>
          <button
            onClick={() => { setGame("all"); setStatus("all"); }}
            className="mt-4 font-[family-name:var(--font-press-start)] text-[8px] text-primary hover:text-secondary"
          >
            CLEAR FILTERS
          </button>
        </div>
      )}
    </div>
  );
}
