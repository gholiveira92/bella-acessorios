import { PrismaClient } from "@prisma/client";

// Force new connection for each request to avoid prepared statement issues with Supabase pooler
export function createPrismaClient() {
  return new PrismaClient({
    log: ["error"],
  });
}

// Export a factory function instead of singleton
export default function getPrisma() {
  return createPrismaClient();
}