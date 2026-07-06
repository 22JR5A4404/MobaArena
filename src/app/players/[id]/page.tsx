"use client";

import { use, useState, useEffect } from "react";
import { getPublicPlayer, getPublicTeam } from "../../actions";
import Link from "next/link";

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [player, setPlayer] = useState<{ id: string; name: string; realName: string; role: string; game: string; teamId: string | null; rating: number; champion: string | null; stats: Record<string, number | undefined> } | null>(null);
  const [team, setTeam] = useState<{ id: string; name: string; tag: string; color: string } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getPublicPlayer(id).then(async (p) => {
      if (!p) {
        setNotFound(true);
        return;
      }
      setPlayer({ ...p, stats: JSON.parse(p.stats || "{}") });
      if (p.teamId) {
        const t = await getPublicTeam(p.teamId);
        setTeam(t);
      }
    });
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="font-[family-name:var(--font-press-start)] text-sm text-text-muted">PLAYER NOT FOUND</p>
        <Link href="/players" className="mt-4 inline-block font-[family-name:var(--font-press-start)] text-[8px] text-primary hover:text-secondary">
          &lt; BACK TO PLAYERS
        </Link>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted animate-pulse">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">
        <Link href="/players" className="hover:text-primary">PLAYERS</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{player.name}</span>
      </div>

      <div className="pixel-card p-0 mb-10">
        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 bg-surface-hover border-[3px] border-border flex items-center justify-center shrink-0">
              <span className="font-[family-name:var(--font-press-start)] text-3xl text-primary crt-glow-green">{player.name[0]}</span>
            </div>
            <div className="flex-1">
              <h1 className="font-[family-name:var(--font-press-start)] text-lg text-primary crt-glow-green mb-2">{player.name}</h1>
              <p className="font-[family-name:var(--font-vt323)] text-xl text-text-muted mb-4">{player.realName}</p>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-2 py-0.5 border text-[8px] font-[family-name:var(--font-press-start)] border-primary text-primary">
                  {player.role}
                </span>
                <span className="px-2 py-0.5 border text-[8px] font-[family-name:var(--font-press-start)] border-secondary text-secondary">
                  {player.game.toUpperCase()}
                </span>
                {player.champion && (
                  <span className="px-2 py-0.5 border text-[8px] font-[family-name:var(--font-press-start)] border-accent text-accent">
                    {player.champion}
                  </span>
                )}
                {team && (
                  <Link
                    href={`/teams/${team.id}`}
                    className="px-2 py-0.5 border text-[8px] font-[family-name:var(--font-press-start)] border-border text-text-muted hover:text-primary hover:border-primary transition-colors"
                  >
                    {team.name}
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-surface-hover border-[3px] border-border p-3 text-center">
                  <p className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-1">MMR</p>
                  <p className="font-[family-name:var(--font-press-start)] text-lg text-primary">{player.rating}</p>
                </div>
                <div className="bg-surface-hover border-[3px] border-border p-3 text-center">
                  <p className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-1">KDA</p>
                  <p className="font-[family-name:var(--font-press-start)] text-lg text-secondary">{player.stats.kda ?? "—"}</p>
                </div>
                <div className="bg-surface-hover border-[3px] border-border p-3 text-center">
                  <p className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-1">WIN RATE</p>
                  <p className="font-[family-name:var(--font-press-start)] text-lg text-primary">{player.stats.winRate ?? "—"}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pixel-card p-6 mb-10">
        <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary mb-6">DETAILED STATS</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "GAMES PLAYED", value: player.stats.gamesPlayed ?? "—", color: "text-text" },
            { label: "KDA", value: player.stats.kda ?? "—", color: "text-secondary" },
            { label: "CS/MIN", value: player.stats.cs ?? "—", color: "text-primary" },
            { label: "VISION SCORE", value: player.stats.visionScore ?? "—", color: "text-retro-cyan" },
            { label: "DMG/GAME", value: player.stats.damagePerGame != null ? player.stats.damagePerGame.toLocaleString() : "—", color: "text-accent" },
            { label: "WIN RATE", value: `${player.stats.winRate ?? "—"}%`, color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-hover border-[3px] border-border p-4">
              <p className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">{stat.label}</p>
              <p className={`font-[family-name:var(--font-press-start)] text-base ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
