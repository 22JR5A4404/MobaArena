"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/H7x";
import TournamentCard from "@/components/Tc4m";
import MatchCard from "@/components/Mc2p";
import SectionHeader from "@/components/Sh6w";
import tournaments from "@/data/tournaments.json";
import matches from "@/data/matches.json";
import teams from "@/data/teams.json";
import Link from "next/link";
import { Tournament, Match as MatchType } from "@/types/t0";
import { getPublicTournaments, getPublicMatches, getPublicTeams } from "./actions";

export default function Home() {
  const [allTournaments, setAllTournaments] = useState(tournaments);
  const [allMatches, setAllMatches] = useState(matches);
  const [allTeams, setAllTeams] = useState(teams);

  useEffect(() => {
    Promise.all([getPublicTournaments(), getPublicMatches(), getPublicTeams()]).then(([t, m, tm]) => {
      if (t.length > 0) setAllTournaments(t.map((tt) => ({ ...tt, rules: JSON.parse(tt.rules || "[]"), bracket: JSON.parse(tt.bracket || "{}") })));
      if (m.length > 0) setAllMatches(m as unknown as typeof matches);
      if (tm.length > 0) setAllTeams(tm.map((team) => ({
        ...team,
        players: JSON.parse(team.players || "[]"),
      })));
    });
  }, []);

  const activeTournaments = allTournaments.filter((t) => t.status === "ongoing" || t.status === "registration");
  const featuredTournaments = activeTournaments.slice(0, 3);
  const upcomingMatches = allMatches.filter((m) => m.status === "scheduled").slice(0, 4);
  const matchesPlayed = allMatches.filter((m) => m.status === "completed").length;
  const totalRegisteredTeams = activeTournaments.reduce((sum, t) => sum + t.registeredTeams, 0);
  const liveGames = [...new Set(allTournaments.filter((t) => t.status === "ongoing").map((t) => t.game))];

  const parsePrize = (prize: string) => {
    const num = parseFloat(prize.replace(/[$,MK]/g, ""));
    if (prize.includes("M")) return num;
    if (prize.includes("K")) return num / 1000;
    return num / 1_000_000;
  };
  const totalPrizePool = allTournaments.reduce((sum, t) => sum + parsePrize(t.prizePool), 0);

  return (
    <>
      <Hero liveGames={liveGames} />

      <section className="bg-surface border-y-3 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "ACTIVE TOURNAMENTS", value: String(activeTournaments.length), color: "text-primary" },
              { label: "REGISTERED TEAMS", value: totalRegisteredTeams > 0 ? `${totalRegisteredTeams}+` : "0", color: "text-secondary" },
              { label: "MATCHES PLAYED", value: matchesPlayed > 0 ? `${matchesPlayed}+` : "0", color: "text-accent" },
              { label: "TOTAL PRIZE POOL", value: `$${totalPrizePool >= 1 ? totalPrizePool.toFixed(1) + "M" : Math.round(totalPrizePool * 1000) + "K"}`, color: "text-retro-yellow" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className={`font-[family-name:var(--font-press-start)] text-xl sm:text-2xl ${stat.color} crt-glow`}>{stat.value}</p>
                <p className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeader
          title="TOURNAMENTS"
          subtitle="Compete in the biggest MOBA events"
          action={{ label: "VIEW ALL", href: "/tournaments" }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t as Tournament} />
          ))}
        </div>
      </section>

      {upcomingMatches.length > 0 && (
        <section className="bg-surface/50 border-y-3 border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <SectionHeader
              title="UPCOMING MATCHES"
              subtitle="Don't miss these scheduled battles"
              action={{ label: "ALL MATCHES", href: "/matches" }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingMatches.map((m) => (
                <MatchCard key={m.id} match={m as MatchType} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeader
          title="TOP TEAMS"
          subtitle="The best MOBA teams in the world right now"
          action={{ label: "ALL TEAMS", href: "/teams" }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allTeams.slice(0, 4).map((team, i) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <div className="pixel-card p-4 hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-[family-name:var(--font-press-start)] text-[10px] text-text-muted">#{i + 1}</span>
                  <div className="w-10 h-10 border-[3px] border-border flex items-center justify-center" style={{ background: `${team.color}20` }}>
                    <span className="font-[family-name:var(--font-press-start)] text-[8px]" style={{ color: team.color }}>{team.tag}</span>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-press-start)] text-[9px] text-text">{team.name}</p>
                    <p className="text-xs text-text-muted">{team.region}</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-primary">{team.wins}W</span>
                  <span className="text-accent">{team.losses}L</span>
                  <span className="text-secondary font-bold">MMR {team.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface border-y-3 border-border pixel-grid">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="font-[family-name:var(--font-press-start)] text-lg sm:text-xl text-primary crt-glow-green mb-6 retro-flicker">
            READY TO COMPETE?
          </h2>
          <p className="font-[family-name:var(--font-vt323)] text-xl text-text-muted mb-8 max-w-xl mx-auto">
            Join the arena. Register your team, enter tournaments, and become a legend.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tournaments" className="retro-btn retro-btn-primary">
              ENTER THE ARENA
            </Link>
            <Link href="/teams" className="retro-btn retro-btn-secondary">
              VIEW TEAMS
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
