import { NextResponse } from "next/server";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { query } from "@/lib/db-direct";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const identifier = `${ip}-${userAgent}`.slice(0, 200);

    const rateLimitResult = await checkRateLimit(identifier, "login");

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Muitas tentativas de login. Tente novamente mais tarde.",
          retryAfter: rateLimitResult.resetAt
            ? Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000)
            : 900,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.resetAt
              ? Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString()
              : "900",
          },
        }
      );
    }

    const users = await query(
      `SELECT id, name, email, password_hash, role, email_verified FROM users WHERE email = $1`,
      [email]
    );
    const user = (users as any[])[0];

    if (!user) {
      return NextResponse.json({ error: "E-mail ou senha incorretos" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json({ error: "E-mail ou senha incorretos" }, { status: 401 });
    }

    if (!user.email_verified) {
      return NextResponse.json(
        { error: "Você precisa confirmar seu e-mail antes de fazer login." },
        { status: 401 }
      );
    }

    await resetRateLimit(identifier, "login");

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    console.error("Login error details:", {
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
  }
}