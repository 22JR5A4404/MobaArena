"use server";

import { db } from "@/lib/x1";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { checkRateLimit, checkBruteForce, recordFailedAttempt, resetFailedAttempts, sanitizeInput, isValidEmail } from "@/lib/x2";
import { _DEVELOPER_SIGNATURE, _verifyIntegrity } from "@/lib/x3";

const USER_SESSION_COOKIE = "user-session";

function setSecureCookie() {
  return { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7 };
}

export async function registerUser(data: {
  email: string;
  name: string;
  password: string;
  game?: string;
}) {
  const { email, name, password, game } = data;

  const rateLimit = checkRateLimit(`register:${email}`);
  if (!rateLimit.allowed) {
    return { success: false, error: `Too many attempts. Try again in ${rateLimit.retryAfter}s` };
  }

  if (!email || !name || !password) {
    return { success: false, error: "All fields are required" };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: "Invalid email format" };
  }

  const sanitizedName = sanitizeInput(name);
  if (sanitizedName.length < 2) {
    return { success: false, error: "Name must be at least 2 characters" };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return { success: false, error: "Password must contain uppercase, lowercase, and number" };
  }

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return { success: false, error: "Email already registered" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      name: sanitizedName,
      passwordHash,
      game: game || "freefire",
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, user.id, setSecureCookie());

  return { success: true };
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const { email, password } = data;

  const rateLimit = checkRateLimit(`login:${email}`);
  if (!rateLimit.allowed) {
    return { success: false, error: `Too many attempts. Try again in ${rateLimit.retryAfter}s` };
  }

  const bruteForce = checkBruteForce(`login:${email}`);
  if (!bruteForce.allowed) {
    return { success: false, error: "Account temporarily locked. Try again in 15 minutes." };
  }

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    recordFailedAttempt(`login:${email}`);
    return { success: false, error: "Invalid email or password" };
  }

  if (user.isBanned) {
    return { success: false, error: "Account has been suspended" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    recordFailedAttempt(`login:${email}`);
    return { success: false, error: "Invalid email or password" };
  }

  resetFailedAttempts(`login:${email}`);

  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, user.id, setSecureCookie());

  return { success: true };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_SESSION_COOKIE);
  return { success: true };
}

export async function getCurrentUser() {
  if (!_verifyIntegrity(_DEVELOPER_SIGNATURE)) return null;
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);
  if (!session?.value) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: session.value },
      select: {
        id: true,
        email: true,
        name: true,
        game: true,
        bio: true,
        favoriteGame: true,
        isBanned: true,
        createdAt: true,
      },
    });
    if (!user || user.isBanned) return null;
    return { ...user, createdAt: user.createdAt.toISOString() };
  } catch {
    return null;
  }
}

export async function updateUserProfile(data: {
  name?: string;
  game?: string;
  bio?: string;
  favoriteGame?: string;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);
  if (!session?.value) {
    return { success: false, error: "Not logged in" };
  }

  const user = await db.user.update({
    where: { id: session.value },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      game: true,
      bio: true,
      favoriteGame: true,
    },
  });

  return { success: true, user };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);
  if (!session?.value) {
    return { success: false, error: "Not logged in" };
  }

  if (data.newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const user = await db.user.findUnique({ where: { id: session.value } });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect" };
  }

  await db.user.update({
    where: { id: session.value },
    data: { passwordHash: await bcrypt.hash(data.newPassword, 10) },
  });

  return { success: true };
}

export async function resetPassword(data: {
  email: string;
  newPassword: string;
}) {
  const { email, newPassword } = data;

  if (!email || !newPassword) {
    return { success: false, error: "All fields are required" };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.isBanned) {
    return { success: false, error: "If an account exists, the password has been reset" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true };
}

export async function registerForTournament(data: {
  tournamentId: string;
  teamName?: string;
  teamTag?: string;
  teamColor?: string;
  gameName?: string;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);
  if (!session?.value) {
    return { success: false, error: "Not logged in" };
  }

  const user = await db.user.findUnique({ where: { id: session.value } });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  const tournament = await db.tournament.findUnique({ where: { id: data.tournamentId } });
  if (!tournament) {
    return { success: false, error: "Tournament not found" };
  }

  if (tournament.status !== "registration") {
    return { success: false, error: "Registration is not open" };
  }

  if (tournament.registeredTeams >= tournament.maxTeams) {
    return { success: false, error: "Tournament is full" };
  }

  const existing = await db.registration.findFirst({
    where: { tournamentId: data.tournamentId, userId: session.value },
  });
  if (existing) {
    return { success: false, error: "Already registered for this tournament" };
  }

  const registration = await db.registration.create({
    data: {
      tournamentId: data.tournamentId,
      userId: session.value,
      teamName: data.teamName || "",
      teamTag: data.teamTag || "",
      teamColor: data.teamColor || "#39ff14",
      playerName: user.name,
      playerEmail: user.email,
      gameName: data.gameName || user.game,
      status: "pending",
    },
  });

  return {
    success: true,
    registrationId: registration.id,
    entryFee: tournament.entryFee,
    whatsapp: tournament.whatsapp,
    organizer: tournament.organizer,
  };
}

export async function cancelRegistration(registrationId: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);
  if (!session?.value) {
    return { success: false, error: "Not logged in" };
  }

  const registration = await db.registration.findUnique({ where: { id: registrationId } });
  if (!registration) {
    return { success: false, error: "Registration not found" };
  }
  if (registration.userId !== session.value) {
    return { success: false, error: "Not authorized" };
  }

  await db.registration.delete({ where: { id: registrationId } });

  if (registration.status === "confirmed") {
    await db.tournament.update({
      where: { id: registration.tournamentId },
      data: { registeredTeams: { decrement: 1 } },
    });
  }

  return { success: true };
}

export async function getUserRegistrations() {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);
  if (!session?.value) return [];

  const registrations = await db.registration.findMany({
    where: { userId: session.value },
    include: { tournament: true },
    orderBy: { createdAt: "desc" },
  });

  return registrations.map((r) => ({
    id: r.id,
    tournamentId: r.tournamentId,
    tournamentName: r.tournament.name,
    tournamentGame: r.tournament.game,
    tournamentStatus: r.tournament.status,
    tournamentPrize: r.tournament.prizePool,
    tournamentEntryFee: r.tournament.entryFee,
    tournamentWhatsapp: r.tournament.whatsapp,
    tournamentOrganizer: r.tournament.organizer,
    teamName: r.teamName,
    teamTag: r.teamTag,
    teamColor: r.teamColor,
    playerName: r.playerName,
    gameName: r.gameName,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getTournamentRegistrations(tournamentId: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);
  if (!session?.value) return [];

  const user = await db.user.findUnique({ where: { id: session.value } });
  if (!user || user.isBanned) return [];

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

export async function sendMessage(data: { subject: string; message: string; email?: string }) {
  const rateLimit = checkRateLimit(`contact:${data.email || "auth"}`);
  if (!rateLimit.allowed) {
    return { success: false, error: `Too many messages. Try again in ${rateLimit.retryAfter}s` };
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);

  let userId = session?.value || "";

  if (!userId && data.email) {
    if (!isValidEmail(data.email)) {
      return { success: false, error: "Invalid email format" };
    }
    const user = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
    userId = user?.id || "anonymous";
  }

  if (!userId) return { success: false, error: "Email required" };

  const { subject, message, email } = data;
  if (!subject || !message) return { success: false, error: "Subject and message required" };

  const validSubjects = ["password-reset"];
  if (!validSubjects.includes(subject)) {
    return { success: false, error: "Invalid subject" };
  }

  const sanitizedMessage = sanitizeInput(message);
  if (sanitizedMessage.length < 10) {
    return { success: false, error: "Message must be at least 10 characters" };
  }

  await db.message.create({
    data: { userId, subject, message: email ? `[${sanitizeInput(email)}] ${sanitizedMessage}` : sanitizedMessage },
  });

  return { success: true };
}

export async function getUserMessages() {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);
  if (!session?.value) return [];

  return db.message.findMany({
    where: { userId: session.value },
    orderBy: { createdAt: "desc" },
  });
}
