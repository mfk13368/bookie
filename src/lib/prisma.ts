import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Absolute path to the database file in the prisma directory
const dbDir = path.resolve(process.cwd(), "prisma");
const dbPath = path.join(dbDir, "dev.db");
const connectionString = `file:${dbPath}`;

// Ensure the directory exists (helps on first run)
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: connectionString,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
