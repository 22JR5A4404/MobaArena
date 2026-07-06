"use server";

import { db } from "@/lib/x1";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { checkRateLimit, checkBruteForce, recordFailedAttempt, resetFailedAttempts } from "@/lib/x2";
import { _DEVELOPER_SIGNATURE, _verifyIntegrity } from "@/lib/x3";

const SESSION_COOKIE = "admin-session";

function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

async function setSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function requireAdmin(): Promise<{ error: string } | null> {
  if (!_verifyIntegrity(_DEVELOPER_SIGNATURE)) return { error: "Unauthorized" };
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) {
    return { error: "Not authenticated" };
  }
  const admin = await db.admin.findFirst();
  if (!admin) {
    return { error: "No admin user found" };
  }
  return null;
}

export async function isAuthenticated(): Promise<boolean> {
  if (!_verifyIntegrity(_DEVELOPER_SIGNATURE)) return false;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return false;
  const admin = await db.admin.findFirst();
  return !!admin;
}

export async function login(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const password = formData.get("password") as string;

  const rateLimit = checkRateLimit("admin:login");
  if (!rateLimit.allowed) {
    return { error: `Too many attempts. Try again in ${rateLimit.retryAfter}s` };
  }

  const bruteForce = checkBruteForce("admin:login");
  if (!bruteForce.allowed) {
    return { error: "Account temporarily locked. Try again in 15 minutes." };
  }

  if (!password) {
    return { error: "Password is required" };
  }

  const admin = await db.admin.findFirst();
  if (!admin) {
    return { error: "Invalid credentials" };
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    recordFailedAttempt("admin:login");
    return { error: "Invalid credentials" };
  }

  resetFailedAttempts("admin:login");

  const token = createSessionToken();
  await setSession(token);

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getDashboardStats() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const [tournamentCount, teamCount, playerCount, matchCount, statusCounts, recentTournaments] = await Promise.all([
    db.tournament.count(),
    db.team.count(),
    db.player.count(),
    db.match.count(),
    db.tournament.groupBy({ by: ["status"], _count: true }),
    db.tournament.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const statusMap: Record<string, number> = {};
  statusCounts.forEach((s) => { statusMap[s.status] = s._count; });

  return {
    tournaments: tournamentCount,
    teams: teamCount,
    players: playerCount,
    matches: matchCount,
    statusCounts: {
      ongoing: statusMap["ongoing"] || 0,
      registration: statusMap["registration"] || 0,
      upcoming: statusMap["upcoming"] || 0,
      completed: statusMap["completed"] || 0,
    },
    recentTournaments,
  };
}

export async function getTournaments() {
  const authError = await requireAdmin();
  if (authError) return [];
  return db.tournament.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getTournament(id: string) {
  const authError = await requireAdmin();
  if (authError) return null;
  return db.tournament.findUnique({ where: { id } });
}

export async function saveTournament(data: {
  id?: string;
  name: string;
  game: string;
  format: string;
  status: string;
  prizePool: string;
  entryFee: string;
  whatsapp: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  organizer: string;
  description: string;
  rules: string[];
  bracket?: string;
}) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };

  const { id, ...rest } = data;
  const rulesJson = JSON.stringify(rest.rules);
  const bracketJson = rest.bracket || "{}";

  if (id && id !== "new") {
    return db.tournament.update({
      where: { id },
      data: { ...rest, rules: rulesJson, bracket: bracketJson },
    });
  }

  const newId = `t-${rest.game}-${Date.now()}-${randomBytes(4).toString("hex")}`;
  return db.tournament.create({
    data: { id: newId, ...rest, rules: rulesJson, bracket: bracketJson },
  });
}

export async function deleteTournament(id: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };
  await db.match.deleteMany({ where: { tournamentId: id } });
  await db.registration.deleteMany({ where: { tournamentId: id } });
  return db.tournament.delete({ where: { id } });
}

export async function getTeams() {
  const authError = await requireAdmin();
  if (authError) return [];
  return db.team.findMany();
}

export async function getTeam(id: string) {
  return db.team.findUnique({ where: { id } });
}

export async function saveTeam(data: {
  id?: string;
  name: string;
  tag: string;
  logo: string;
  game: string;
  region: string;
  rating: number;
  wins: number;
  losses: number;
  captain: string;
  founded: string;
  description: string;
  color: string;
  players: string[];
}) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };

  const { id, ...rest } = data;
  const playersJson = JSON.stringify(rest.players);

  if (id && id !== "new") {
    return db.team.update({
      where: { id },
      data: { ...rest, players: playersJson },
    });
  }

  const newId = `team-${rest.tag.toLowerCase()}-${Date.now()}-${randomBytes(4).toString("hex")}`;
  return db.team.create({
    data: { id: newId, ...rest, players: playersJson },
  });
}

export async function deleteTeam(id: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };
  return db.team.delete({ where: { id } });
}

export async function getPlayers() {
  const authError = await requireAdmin();
  if (authError) return [];
  return db.player.findMany();
}

export async function getPlayer(id: string) {
  return db.player.findUnique({ where: { id } });
}

export async function savePlayer(data: {
  id?: string;
  name: string;
  realName: string;
  role: string;
  game: string;
  teamId: string | null;
  rating: number;
  champion: string | null;
  stats: Record<string, number>;
}) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };

  const { id, ...rest } = data;
  const statsJson = JSON.stringify(rest.stats);

  if (id && id !== "new") {
    return db.player.update({
      where: { id },
      data: { ...rest, stats: statsJson },
    });
  }

  const newId = `p-${Date.now()}-${randomBytes(4).toString("hex")}`;
  return db.player.create({
    data: { id: newId, ...rest, stats: statsJson },
  });
}

export async function deletePlayer(id: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };
  return db.player.delete({ where: { id } });
}

export async function getMatches() {
  const authError = await requireAdmin();
  if (authError) return [];
  return db.match.findMany();
}

export async function getMatch(id: string) {
  return db.match.findUnique({ where: { id } });
}

export async function saveMatch(data: {
  id?: string;
  tournamentId: string;
  tournamentName: string;
  game: string;
  team1: string;
  team2: string;
  team1Score: number | null;
  team2Score: number | null;
  status: string;
  date: string;
  time: string;
  streamUrl?: string;
  patch?: string;
}) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };

  const { id, ...rest } = data;

  if (id && id !== "new") {
    return db.match.update({
      where: { id },
      data: rest,
    });
  }

  const newId = `m-${Date.now()}-${randomBytes(4).toString("hex")}`;
  return db.match.create({
    data: { id: newId, ...rest },
  });
}

export async function deleteMatch(id: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };
  return db.match.delete({ where: { id } });
}

export async function getMessages() {
  const authError = await requireAdmin();
  if (authError) return [];

  return db.message.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function markMessageRead(id: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };

  await db.message.update({ where: { id }, data: { read: true } });
  return { success: true };
}

export async function deleteMessage(id: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };
  return db.message.delete({ where: { id } });
}

export async function createResetToken(email: string, type: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { success: false, error: "User not found" };

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.resetToken.create({
    data: { email, type, token, expiresAt },
  });

  return { success: true, token, email };
}

export async function getResetTokens() {
  const authError = await requireAdmin();
  if (authError) return [];

  return db.resetToken.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteResetToken(id: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };
  return db.resetToken.delete({ where: { id } });
}

export async function verifyRecoveryKey(key: string) {
  const rateLimit = checkRateLimit("admin:recovery");
  if (!rateLimit.allowed) {
    return { success: false, error: `Too many attempts. Try again in ${rateLimit.retryAfter}s` };
  }

  const validKey = process.env.ADMIN_RECOVERY_KEY;
  if (!validKey) {
    return { success: false, error: "Recovery not configured" };
  }

  if (key !== validKey) {
    recordFailedAttempt("admin:recovery");
    return { success: false, error: "Invalid recovery key" };
  }

  resetFailedAttempts("admin:recovery");
  resetFailedAttempts("admin:login");

  const token = createSessionToken();
  await setSession(token);

  return { success: true };
}

export async function adminResetPassword(newPassword: string) {
  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return { success: false, error: "Password must contain uppercase, lowercase, and number" };
  }

  const admin = await db.admin.findFirst();
  if (!admin) return { success: false, error: "Admin not found" };

  await db.admin.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });

  return { success: true };
}
