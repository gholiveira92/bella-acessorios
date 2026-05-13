import { PrismaClient } from "@prisma/client";

// Export singleton for TypeScript type inference
export const prisma = new PrismaClient({
  log: ["error"],
});

export default prisma;