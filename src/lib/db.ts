import { PrismaClient } from "@prisma/client";

// Export singleton that works with TypeScript
const prismaClient = new PrismaClient({
  log: ["error"],
});

export const prisma = prismaClient;

export default prisma;