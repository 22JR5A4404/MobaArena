import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import tournaments from "../src/data/tournaments.json";
import teams from "../src/data/teams.json";
import players from "../src/data/players.json";
import matches from "../src/data/matches.json";
import leaderboards from "../src/data/leaderboards.json";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.match.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.team.deleteMany();
  await prisma.player.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.admin.deleteMany();

  for (const t of tournaments) {
    await prisma.tournament.create({
      data: {
        id: t.id,
        name: t.name,
        game: t.game,
        format: t.format,
        status: t.status,
        prizePool: t.prizePool,
        startDate: t.startDate,
        endDate: t.endDate,
        registrationDeadline: t.registrationDeadline,
        maxTeams: t.maxTeams,
        registeredTeams: t.registeredTeams,
        organizer: t.organizer,
        description: t.description,
        rules: JSON.stringify(t.rules),
        bracket: JSON.stringify(t.bracket || {}),
      },
    });
  }
  console.log(`Seeded ${tournaments.length} tournaments`);

  for (const t of teams) {
    await prisma.team.create({
      data: {
        id: t.id,
        name: t.name,
        tag: t.tag,
        logo: t.logo,
        game: t.game,
        region: t.region,
        rating: t.rating,
        wins: t.wins,
        losses: t.losses,
        players: JSON.stringify(t.players),
        captain: t.captain,
        founded: t.founded,
        description: t.description,
        color: t.color,
      },
    });
  }
  console.log(`Seeded ${teams.length} teams`);

  for (const p of players) {
    await prisma.player.create({
      data: {
        id: p.id,
        name: p.name,
        realName: p.realName,
        role: p.role,
        game: p.game,
        teamId: p.teamId || null,
        rating: p.rating,
        champion: p.champion || null,
        stats: JSON.stringify(p.stats),
      },
    });
  }
  console.log(`Seeded ${players.length} players`);

  for (const m of matches) {
    await prisma.match.create({
      data: {
        id: m.id,
        tournamentId: m.tournamentId,
        tournamentName: m.tournamentName,
        game: m.game,
        team1: m.team1,
        team2: m.team2,
        team1Score: m.team1Score,
        team2Score: m.team2Score,
        status: m.status,
        date: m.date,
        time: m.time,
        streamUrl: m.streamUrl || null,
        patch: m.patch || null,
      },
    });
  }
  console.log(`Seeded ${matches.length} matches`);

  for (const lb of leaderboards) {
    await prisma.leaderboard.create({
      data: {
        id: `lb-${lb.teamId}`,
        rank: lb.rank,
        teamId: lb.teamId,
        teamName: lb.teamName,
        teamTag: lb.teamTag,
        game: lb.game,
        rating: lb.rating,
        wins: lb.wins,
        losses: lb.losses,
        winRate: lb.winRate,
        streak: lb.streak,
      },
    });
  }
  console.log(`Seeded ${leaderboards.length} leaderboard entries`);

  const passwordHash = await bcrypt.hash("moba-arena-2026", 12);
  await prisma.admin.create({
    data: {
      username: "admin",
      passwordHash,
    },
  });
  console.log("Seeded admin user (admin / moba-arena-2026)");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
