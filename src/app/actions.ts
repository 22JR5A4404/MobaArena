"use server";

import { db } from "@/lib/x1";

export async function getPublicTournaments() {
  const ts = await db.tournament.findMany({ orderBy: { createdAt: "desc" } });
  return ts.map((t) => ({ ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() }));
}

export async function getPublicTournament(id: string) {
  const t = await db.tournament.findUnique({ where: { id } });
  if (!t) return null;
  return { ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() };
}

export async function getPublicTeams() {
  return db.team.findMany();
}

export async function getPublicTeam(id: string) {
  return db.team.findUnique({ where: { id } });
}

export async function getPublicPlayers() {
  return db.player.findMany();
}

export async function getPublicPlayer(id: string) {
  return db.player.findUnique({ where: { id } });
}

export async function getPublicMatches() {
  return db.match.findMany();
}

export async function getPublicLeaderboard() {
  return db.leaderboard.findMany({ orderBy: { rank: "asc" } });
}

export async function getPublicTournamentRegistrations(tournamentId: string) {
  const registrations = await db.registration.findMany({
    where: { tournamentId },
    orderBy: { createdAt: "desc" },
  });
  return registrations.map((r) => ({
    id: r.id,
    userId: r.userId,
    teamName: r.teamName,
    teamTag: r.teamTag,
    teamColor: r.teamColor,
    playerName: r.playerName,
    playerEmail: r.playerEmail,
    gameName: r.gameName,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}
