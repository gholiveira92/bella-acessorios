import { query } from "./db-direct";

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

  const records = await query(`
    SELECT id, attempts, blocked, created_at 
    FROM rate_limit_records 
    WHERE identifier = $1 AND action = $2 AND created_at >= $3
    ORDER BY created_at DESC
    LIMIT 1
  `, [identifier, action, windowStart.toISOString()]);

  const record = (records as any[])[0];

  if (record?.blocked) {
    const blockExpires = new Date(new Date(record.created_at).getTime() + config.blockSeconds * 1000);
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
    const newAttempts = attempts + 1;
    const newBlocked = true;
    
    if (record?.id) {
      await query(`
        UPDATE rate_limit_records 
        SET attempts = $1, blocked = $2, created_at = $3 
        WHERE id = $4
      `, [newAttempts, newBlocked, now.toISOString(), record.id]);
    } else {
      await query(`
        INSERT INTO rate_limit_records (id, identifier, action, attempts, blocked, created_at)
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)
      `, [identifier, action, newAttempts, newBlocked, now.toISOString()]);
    }

    return {
      success: false,
      remaining: 0,
      resetAt: blockEnd,
      blocked: true,
    };
  }

  if (record?.id) {
    await query(`
      UPDATE rate_limit_records SET attempts = attempts + 1 WHERE id = $1
    `, [record.id]);
  } else {
    await query(`
      INSERT INTO rate_limit_records (id, identifier, action, attempts, blocked, created_at)
      VALUES (gen_random_uuid()::text, $1, $2, 1, false, $3)
    `, [identifier, action, now.toISOString()]);
  }

  return {
    success: true,
    remaining: remaining - 1,
  };
}

export async function resetRateLimit(identifier: string, action: string): Promise<void> {
  await query(`DELETE FROM rate_limit_records WHERE identifier = $1 AND action = $2`, [identifier, action]);
}