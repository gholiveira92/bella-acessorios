import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  let databaseUrl = process.env.DATABASE_URL || "";

  // Add unique identifier to disable prepared statement caching
  const separator = databaseUrl.includes("?") ? "&" : "?";
  const uniqueId = `t=${Date.now()}&r=${Math.random()}`;
  
  // Use session mode for Supabase pooler (bypass prepared statements issue)
  if (databaseUrl.includes("pooler.supabase.com")) {
    // Append cache disable and unique identifier
    databaseUrl = databaseUrl.replace(
      /(?:\?|&)prepared_statement_cache(?:=[^&]*)?/gi,
      ""
    ).replace(
      /(?:\?|&)application_name(?:=[^&]*)?/gi,
      ""
    );
    
    if (!databaseUrl.includes("prepared_statement_cache")) {
      databaseUrl += `${separator}prepared_statement_cache=0`;
    }
    if (!databaseUrl.includes("application_name")) {
      databaseUrl += `&application_name=prisma_${uniqueId}`;
    }
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