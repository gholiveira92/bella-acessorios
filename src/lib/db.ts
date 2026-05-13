import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  // Add cache bypass parameters for Supabase connection pooler
  let databaseUrl = process.env.DATABASE_URL || "";
  
  // Supabase pooler prepared statement workaround
  if (!databaseUrl.includes("pg_session_id")) {
    const separator = databaseUrl.includes("?") ? "&" : "?";
    const bypassParams = `${separator}pg_session_id=${Date.now()}_${Math.random().toString(36).substring(7)}`;
    databaseUrl = databaseUrl.replace(bypassParams, "").replace(/pg_session_id=[^&]*/g, "");
    databaseUrl += bypassParams;
  }

  return new PrismaClient({
    datasourceUrl: databaseUrl,
    log: ["error"],
  });
}

const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;

export async function disconnectPrisma() {
  if (global.prisma) {
    await global.prisma.$disconnect();
    global.prisma = undefined;
  }
}