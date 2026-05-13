import { NextResponse } from "next/server";
import { signIn } from "next-auth/react";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { query } from "@/lib/db-direct";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
const { email, password } = await request.json();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes("CONFIRM_EMAIL_REQUIRED")) {
        return NextResponse.json(
          { error: "Você precisa confirmar seu e-mail antes de fazer login." },
          { status: 401 }
        );
      }
      
      const users = await query(`SELECT id FROM users WHERE email = $1`, [email]);
      const user = (users as any[])[0];

      if (user) {
        return NextResponse.json(
          { error: "E-mail ou senha incorretos", attempts: rateLimitResult.remaining },
          { status: 401 }
        );
      }
    }

    if (!result?.error) {
      await resetRateLimit(identifier, "login");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erro ao fazer login" },
      { status: 500 }
    );
  }
}