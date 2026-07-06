"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardStats } from "./actions";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    tournaments: number;
    teams: number;
    players: number;
    matches: number;
    statusCounts: { ongoing: number; registration: number; upcoming: number; completed: number };
    recentTournaments: Array<{
      id: string;
      name: string;
      game: string;
      status: string;
      registeredTeams: number;
      maxTeams: number;
    }>;
  } | null>(null);

  useEffect(() => {
    getDashboardStats().then((result) => {
      if (result && !("error" in result)) {
        setStats(result);
      }
    });
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted animate-pulse">LOADING...</p>
      </div>
    );
  }

  const statCards = [
    { label: "TOURNAMENTS", value: stats.tournaments, color: "text-primary", href: "/admin/tournaments" },
    { label: "TEAMS", value: stats.teams, color: "text-secondary", href: "/admin/teams" },
    { label: "PLAYERS", value: stats.players, color: "text-accent", href: "/admin/players" },
    { label: "MATCHES", value: stats.matches, color: "text-retro-yellow", href: "/admin/matches" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green mb-2">
          DASHBOARD
        </h1>
        <p className="font-[family-name:var(--font-vt323)] text-lg text-text-muted">
          Welcome to MOBA Arena Admin.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="pixel-card p-5 hover:border-primary transition-colors cursor-pointer group">
              <p className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">{stat.label}</p>
              <p className={`font-[family-name:var(--font-press-start)] text-2xl ${stat.color} group-hover:crt-glow transition-all`}>{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "LIVE", value: stats.statusCounts.ongoing, color: "border-accent text-accent" },
          { label: "REG OPEN", value: stats.statusCounts.registration, color: "border-primary text-primary" },
          { label: "UPCOMING", value: stats.statusCounts.upcoming, color: "border-secondary text-secondary" },
          { label: "COMPLETED", value: stats.statusCounts.completed, color: "border-border text-text-muted" },
        ].map((item) => (
          <div key={item.label} className={`pixel-card p-4 border-[3px] ${item.color}`}>
            <p className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-1">{item.label}</p>
            <p className={`font-[family-name:var(--font-press-start)] text-lg ${item.color.split(" ")[1]}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="pixel-card p-6 mb-10">
        <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary mb-6">QUICK ACTIONS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "NEW TOURNAMENT", href: "/admin/tournaments/new", color: "retro-btn-primary" },
            { label: "ADD TEAM", href: "/admin/teams/new", color: "retro-btn-secondary" },
            { label: "ADD PLAYER", href: "/admin/players/new", color: "retro-btn-primary" },
            { label: "SCHEDULE MATCH", href: "/admin/matches/new", color: "retro-btn-secondary" },
          ].map((action) => (
            <Link key={action.label} href={action.href} className={`retro-btn ${action.color} block text-center w-full`}>
              <span className="block">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="pixel-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary">RECENT TOURNAMENTS</h3>
          <Link href="/admin/tournaments" className="font-[family-name:var(--font-press-start)] text-[7px] text-secondary hover:text-primary">
            VIEW ALL &gt;&gt;
          </Link>
        </div>
        <div className="space-y-3">
          {stats.recentTournaments.map((t) => (
            <Link
              key={t.id}
              href={`/admin/tournaments/${t.id}`}
              className="flex items-center justify-between px-4 py-3 bg-surface-hover border-2 border-border hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted shrink-0">{t.game.toUpperCase()}</span>
                <span className="font-[family-name:var(--font-press-start)] text-[9px] text-text truncate">{t.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-text-muted">{t.registeredTeams}/{t.maxTeams} teams</span>
                <span className={`px-2 py-0.5 border text-[7px] font-[family-name:var(--font-press-start)] ${
                  t.status === "ongoing" ? "border-accent text-accent" :
                  t.status === "registration" ? "border-primary text-primary" :
                  "border-border text-text-muted"
                }`}>
                  {t.status.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
