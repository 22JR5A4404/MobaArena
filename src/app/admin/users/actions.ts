"use server";

import { db } from "@/lib/x1";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
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

export async function getAllUsers() {
  const authError = await requireAdmin();
  if (authError) return [];

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      game: true,
      bio: true,
      favoriteGame: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));
}

export async function getUserById(id: string) {
  const authError = await requireAdmin();
  if (authError) return null;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      game: true,
      bio: true,
      favoriteGame: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) return null;
  return { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() };
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  game?: string;
  bio?: string;
  favoriteGame?: string;
}) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };

  if (!data.email || !data.name || !data.password) {
    return { success: false, error: "All fields are required" };
  }
  if (data.password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { success: false, error: "Email already exists" };
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await db.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      game: data.game || "freefire",
      bio: data.bio || "",
      favoriteGame: data.favoriteGame || "",
    },
  });
  return { success: true, userId: user.id };
}

export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  game?: string;
  bio?: string;
  favoriteGame?: string;
  isBanned?: boolean;
}) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };

  try {
    await db.user.update({ where: { id }, data });
    return { success: true };
  } catch {
    return { success: false, error: "User not found" };
  }
}

export async function deleteUser(id: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error };

  try {
    await db.user.delete({ where: { id } });
    return { success: true };
  } catch {
    return { success: false, error: "User not found" };
  }
}

export async function toggleBanUser(id: string) {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError.error, isBanned: false };

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return { success: false, error: "User not found" as string, isBanned: false };
  const newBanned = !user.isBanned;
  await db.user.update({ where: { id }, data: { isBanned: newBanned } });
  return { success: true, isBanned: newBanned };
}

export async function getUserStats() {
  const authError = await requireAdmin();
  if (authError) return { total: 0, banned: 0, active: 0 };

  const total = await db.user.count();
  const banned = await db.user.count({ where: { isBanned: true } });
  return { total, banned, active: total - banned };
}
