import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Absolute path to the database file in the prisma directory
// Using path.resolve and ensuring the file protocol is handled for Windows
const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const connectionString = `file:${dbPath}`;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: connectionString,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
