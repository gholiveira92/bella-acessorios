import { NextResponse } from "next/server";
import { signIn } from "next-auth/react";
import prisma from "@/lib/db";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

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

    const result = await signIn("credentials", {
      email,
      password: "",
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes("CONFIRM_EMAIL_REQUIRED")) {
        return NextResponse.json(
          { error: "Você precisa confirmar seu e-mail antes de fazer login." },
          { status: 401 }
        );
      }
      
      const user = await prisma.user.findUnique({
        where: { email },
      });

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