import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token e e-mail são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
        confirmationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token de confirmação inválido" },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "E-mail já confirmado anteriormente",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        confirmationToken: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "E-mail confirmado com sucesso!",
    });
  } catch (error) {
    console.error("Confirm email error:", error);
    return NextResponse.json(
      { error: "Erro ao confirmar e-mail" },
      { status: 500 }
    );
  }
}