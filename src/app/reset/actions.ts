"use server";

import { db } from "@/lib/x1";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/x2";

export async function verifyResetToken(token: string) {
  if (!token || token.length < 32) {
    return { valid: false };
  }

  const resetToken = await db.resetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.used || new Date(resetToken.expiresAt) < new Date()) {
    return { valid: false };
  }
  return { valid: true, type: resetToken.type, email: resetToken.email };
}

export async function resetPassword(token: string, newPassword: string) {
  const rateLimit = checkRateLimit(`reset:${token.slice(0, 8)}`);
  if (!rateLimit.allowed) {
    return { success: false, error: `Too many attempts. Try again in ${rateLimit.retryAfter}s` };
  }

  if (!token || token.length < 32) {
    return { success: false, error: "Invalid token" };
  }

  const resetToken = await db.resetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.used || new Date(resetToken.expiresAt) < new Date()) {
    return { success: false, error: "Invalid or expired token" };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return { success: false, error: "Password must contain uppercase, lowercase, and number" };
  }

  const user = await db.user.findUnique({ where: { email: resetToken.email } });
  if (!user) return { success: false, error: "User not found" };

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });

  await db.resetToken.update({ where: { token }, data: { used: true } });
  return { success: true };
}
