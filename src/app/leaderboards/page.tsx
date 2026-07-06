"use client";

import { useState, useEffect } from "react";
import { getPublicLeaderboard, getPublicTeams } from "../actions";
import Link from "next/link";
import SectionHeader from "@/components/Sh6w";

const GAME_COLORS: Record<string, string> = {
  freefire: "text-primary",
  pubg: "text-accent",
  cod: "text-secondary",
};

interface LeaderboardRow {
  rank: number;
  teamId: string;
  teamName: string;
  teamTag: string;
  game: string;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: string;
}

export default function LeaderboardsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [teamMap, setTeamMap] = useState<Record<string, { id: string; name: string; tag: string; color: string }>>({});

  useEffect(() => {
    Promise.all([getPublicLeaderboard(), getPublicTeams()]).then(([lb, teams]) => {
      setLeaderboard(lb);
      setTeamMap(Object.fromEntries(teams.map((t) => [t.id, t])));
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader title="LEADERBOARDS" subtitle="Global team rankings across all MOBA games" />

      <div className="pixel-card p-0 mb-10">
        <div className="px-6 py-4 border-b-3 border-border bg-surface-hover">
          <h3 className="font-[family-name:var(--font-press-start)] text-[9px] text-primary crt-glow-green">GLOBAL RANKINGS</h3>
          <p className="text-xs text-text-muted mt-1">Updated daily &middot; MMR-based</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-3 border-border">
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">RANK</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">TEAM</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden sm:table-cell">GAME</th>
                <th className="text-center py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">MMR</th>
                <th className="text-center py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden md:table-cell">W/L</th>
                <th className="text-center py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hidden md:table-cell">WIN%</th>
                <th className="text-center py-3 px-4 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">STREAK</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => {
                const team = teamMap[entry.teamId];
                return (
                  <tr key={entry.teamId} className="border-b border-border hover:bg-surface-hover transition-colors">
                    <td className="py-4 px-4">
                      <span className={`font-[family-name:var(--font-press-start)] text-[10px] ${
                        entry.rank === 1 ? "text-primary crt-glow-green" :
                        entry.rank === 2 ? "text-secondary" :
                        entry.rank === 3 ? "text-retro-yellow" :
                        "text-text-muted"
                      }`}>
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Link href={`/teams/${entry.teamId}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 border-[3px] border-border flex items-center justify-center" style={{ background: team ? `${team.color}20` : "transparent" }}>
                          <span className="font-[family-name:var(--font-press-start)] text-[7px]" style={{ color: team?.color }}>{entry.teamTag}</span>
                        </div>
                        <span className="font-[family-name:var(--font-press-start)] text-[9px] text-text hover:text-primary transition-colors">{entry.teamName}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className={`font-[family-name:var(--font-press-start)] text-[7px] ${GAME_COLORS[entry.game]}`}>
                        {entry.game.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-[family-name:var(--font-press-start)] text-[10px] text-primary">{entry.rating}</span>
                    </td>
                    <td className="py-4 px-4 text-center hidden md:table-cell">
                      <span className="text-xs">
                        <span className="text-success">{entry.wins}W</span> / <span className="text-accent">{entry.losses}L</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center hidden md:table-cell">
                      <span className="font-[family-name:var(--font-press-start)] text-[9px] text-text">{entry.winRate}%</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-[family-name:var(--font-press-start)] text-[8px] ${
                        entry.streak.startsWith("W") ? "text-success" : "text-accent"
                      }`}>
                        {entry.streak}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "TOTAL TEAMS", value: "8", color: "text-primary" },
          { label: "GAMES TRACKED", value: "3", color: "text-secondary" },
          { label: "AVG WIN RATE", value: "72%", color: "text-accent" },
          { label: "TOP STREAK", value: "W12", color: "text-retro-yellow" },
        ].map((stat) => (
          <div key={stat.label} className="pixel-card p-4 text-center">
            <p className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">{stat.label}</p>
            <p className={`font-[family-name:var(--font-press-start)] text-lg ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
