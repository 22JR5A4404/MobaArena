"use client";

import { use, useState, useEffect } from "react";
import { getPublicTeam, getPublicPlayers, getPublicMatches } from "../../actions";
import MatchCard from "@/components/Mc2p";
import Link from "next/link";
import { Match } from "@/types/t0";

const GAME_LABELS: Record<string, string> = {
  freefire: "FREE FIRE",
  pubg: "PUBG",
  cod: "CALL OF DUTY",
};

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [team, setTeam] = useState<{ id: string; name: string; tag: string; game: string; region: string; rating: number; wins: number; losses: number; color: string; description: string; players: string[] } | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<{ id: string; name: string; role: string; champion: string | null; stats: Record<string, number | undefined> }[]>([]);
  const [teamMatches, setTeamMatches] = useState<{ id: string; team1: string; team2: string; team1Score: number | null; team2Score: number | null; status: string; date: string; time: string }[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      getPublicTeam(id),
      getPublicPlayers(),
      getPublicMatches(),
    ]).then(([t, allPlayers, allMatches]) => {
      if (!t) {
        setNotFound(true);
        return;
      }
      const playerIds = JSON.parse(t.players || "[]");
      const players = allPlayers.filter((p) => playerIds.includes(p.id)).map((p) => ({
        ...p,
        stats: JSON.parse(p.stats || "{}"),
      }));
      const matches = allMatches.filter((m) => m.team1 === t.id || m.team2 === t.id).slice(0, 6);
      setTeam({ ...t, players: playerIds });
      setTeamPlayers(players);
      setTeamMatches(matches);
    });
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="font-[family-name:var(--font-press-start)] text-sm text-text-muted">TEAM NOT FOUND</p>
        <Link href="/teams" className="mt-4 inline-block font-[family-name:var(--font-press-start)] text-[8px] text-primary hover:text-secondary">
          &lt; BACK TO TEAMS
        </Link>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted animate-pulse">LOADING...</p>
      </div>
    );
  }

  const winRate = (team.wins + team.losses) > 0 ? ((team.wins / (team.wins + team.losses)) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">
        <Link href="/teams" className="hover:text-primary">TEAMS</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{team.name}</span>
      </div>

      <div className="pixel-card p-0 mb-10">
        <div className="h-2" style={{ background: team.color }} />
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-20 h-20 border-[3px] border-border flex items-center justify-center shrink-0" style={{ background: `${team.color}20` }}>
              <span className="font-[family-name:var(--font-press-start)] text-lg font-bold" style={{ color: team.color }}>{team.tag}</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-[family-name:var(--font-press-start)] text-base sm:text-lg text-text">{team.name}</h1>
                <span className="px-2 py-0.5 border text-[8px] font-[family-name:var(--font-press-start)] border-primary text-primary">
                  {GAME_LABELS[team.game]}
                </span>
                <span className="px-2 py-0.5 border text-[8px] font-[family-name:var(--font-press-start)] border-border text-text-muted">
                  {team.region}
                </span>
              </div>
              <p className="font-[family-name:var(--font-vt323)] text-lg text-text-muted mb-6">{team.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "MMR", value: team.rating, color: "text-primary" },
                  { label: "WINS", value: team.wins, color: "text-success" },
                  { label: "LOSSES", value: team.losses, color: "text-accent" },
                  { label: "WIN RATE", value: `${winRate}%`, color: "text-secondary" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-surface-hover border-[3px] border-border p-3 text-center">
                    <p className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-1">{stat.label}</p>
                    <p className={`font-[family-name:var(--font-press-start)] text-sm ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary mb-4">ROSTER</h3>
          <div className="space-y-3">
            {teamPlayers.map((player) => (
              <Link key={player.id} href={`/players/${player.id}`}>
                <div className="pixel-card p-4 flex items-center gap-3 hover:border-primary transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-surface-hover border-[3px] border-border flex items-center justify-center">
                    <span className="font-[family-name:var(--font-press-start)] text-sm text-primary">{player.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-[family-name:var(--font-press-start)] text-[9px] text-text">{player.name}</p>
                    <p className="text-xs text-text-muted">{player.role}</p>
                  </div>
                  {player.champion && (
                    <span className="font-[family-name:var(--font-press-start)] text-[7px] text-secondary">{player.champion}</span>
                  )}
                </div>
              </Link>
            ))}
            {teamPlayers.length === 0 && (
              <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">NO ROSTER DATA</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary mb-4">RECENT MATCHES</h3>
          {teamMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMatches.map((m) => (
                <MatchCard key={m.id} match={m as Match} />
              ))}
            </div>
          ) : (
            <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">NO MATCH HISTORY</p>
          )}
        </div>
      </div>
    </div>
  );
}
