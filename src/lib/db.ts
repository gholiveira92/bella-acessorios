import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || "";
  
  const urlWithNoCache = databaseUrl.includes("prepared_statement_cache")
    ? databaseUrl
    : databaseUrl + (databaseUrl.includes("?") ? "&" : "?") + "prepared_statement_cache=0";

  return new PrismaClient({
    datasources: {
      db: {
        url: urlWithNoCache,
      },
    },
    log: ["error"],
  });
}

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}