import prisma from "./db";

interface RateLimitConfig {
  maxAttempts: number;
  windowSeconds: number;
  blockSeconds: number;
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 5,
  windowSeconds: 60,
  blockSeconds: 900,
};

export async function checkRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig = defaultConfig
): Promise<{ success: boolean; remaining: number; resetAt?: Date; blocked?: boolean }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);
  const blockEnd = new Date(now.getTime() + config.blockSeconds * 1000);

  const record = await prisma.rateLimitRecord.findFirst({
    where: {
      identifier,
      action,
      createdAt: { gte: windowStart },
    },
    orderBy: { createdAt: "desc" },
  });

  if (record?.blocked) {
    const blockExpires = new Date(record.createdAt.getTime() + config.blockSeconds * 1000);
    if (blockExpires > now) {
      return {
        success: false,
        remaining: 0,
        resetAt: blockExpires,
        blocked: true,
      };
    }
  }

  const attempts = record?.attempts || 0;
  const remaining = Math.max(0, config.maxAttempts - attempts);

  if (attempts >= config.maxAttempts) {
    await prisma.rateLimitRecord.upsert({
      where: { id: record?.id || "" },
      create: {
        identifier,
        action,
        attempts: attempts + 1,
        blocked: true,
        createdAt: now,
      },
      update: {
        attempts: attempts + 1,
        blocked: true,
        createdAt: now,
      },
    });

    return {
      success: false,
      remaining: 0,
      resetAt: blockEnd,
      blocked: true,
    };
  }

  if (record) {
    await prisma.rateLimitRecord.update({
      where: { id: record.id },
      data: { attempts: attempts + 1 },
    });
  } else {
    await prisma.rateLimitRecord.create({
      data: {
        identifier,
        action,
        attempts: 1,
        blocked: false,
        createdAt: now,
      },
    });
  }

  return {
    success: true,
    remaining: remaining - 1,
  };
}

export async function resetRateLimit(identifier: string, action: string): Promise<void> {
  await prisma.rateLimitRecord.deleteMany({
    where: { identifier, action },
  });
}