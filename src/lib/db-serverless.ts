import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaServerless: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaServerless ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaServerless = prisma;