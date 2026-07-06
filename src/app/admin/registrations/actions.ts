"use server";

import { db } from "@/lib/x1";
import { cookies } from "next/headers";
import { _DEVELOPER_SIGNATURE, _verifyIntegrity } from "@/lib/x3";

const SESSION_COOKIE = "admin-session";

async function requireAdmin(): Promise<{ error: string } | null> {
  if (!_verifyIntegrity(_DEVELOPER_SIGNATURE)) return { error: "Unauthorized" };
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) {
    return { error: "Not authenticated" };
  }
  const admin = await db.admin.findFirst();
  if (!admin) {
    return { error: "Not authenticated" };
  }
  return null;
}

const VALID_STATUSES = ["pending", "confirmed", "rejected", "cancelled"];

export async function getAllRegistrations() {
  const authError = await requireAdmin();
  if (authError) return [];

  const registrations = await db.registration.findMany({
    include: { tournament: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return registrations.map((r) => ({
    id: r.id,
    tournamentId: r.tournamentId,
    tournamentName: r.tournament.name,
    tournamentGame: r.tournament.game,
    tournamentStatus: r.tournament.status,
    userId: r.userId,
    userName: r.user.name,
    userEmail: r.user.email,
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

export async function updateRegistrationStatus(id: string, status: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };

  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: "Invalid status" };
  }

  const reg = await db.registration.findUnique({ where: { id } });
  if (!reg) return { success: false, error: "Registration not found" };

  const wasConfirmed = reg.status === "confirmed";
  const nowConfirmed = status === "confirmed";

  await db.registration.update({ where: { id }, data: { status } });

  if (!wasConfirmed && nowConfirmed) {
    await db.tournament.update({
      where: { id: reg.tournamentId },
      data: { registeredTeams: { increment: 1 } },
    });
  } else if (wasConfirmed && !nowConfirmed) {
    await db.tournament.update({
      where: { id: reg.tournamentId },
      data: { registeredTeams: { decrement: 1 } },
    });
  }

  return { success: true };
}

export async function deleteRegistration(id: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };

  const reg = await db.registration.findUnique({ where: { id } });
  if (!reg) return { success: false, error: "Not found" };

  await db.registration.delete({ where: { id } });

  if (reg.status === "confirmed") {
    await db.tournament.update({
      where: { id: reg.tournamentId },
      data: { registeredTeams: { decrement: 1 } },
    });
  }
  return { success: true };
}

export async function getRegistrationStats() {
  const authError = await requireAdmin();
  if (authError) return { total: 0, pending: 0, confirmed: 0 };

  const total = await db.registration.count();
  const pending = await db.registration.count({ where: { status: "pending" } });
  const confirmed = await db.registration.count({ where: { status: "confirmed" } });
  return { total, pending, confirmed };
}
