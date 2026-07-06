import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function resolveDbUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.includes(":")) {
    const dbPath = envUrl.replace("file:", "");
    if (dbPath.startsWith("/")) return envUrl;
  }
  return "file:/Users/charan/Desktop/website/My-website/moba-arena/dev.db";
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: resolveDbUrl() });
  const client = new PrismaClient({ adapter });
  return client;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
