import { NextResponse } from "next/server";
import { query } from "@/lib/db-direct";

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

    const users = await query(`
      SELECT id, email_verified FROM users 
      WHERE email = $1 AND confirmation_token = $2
      LIMIT 1
    `, [email, token]);

    const user = (users as any[])[0];

    if (!user) {
      return NextResponse.json(
        { error: "Token de confirmação inválido" },
        { status: 400 }
      );
    }

    if (user.email_verified) {
      return NextResponse.json({
        success: true,
        message: "E-mail já confirmado anteriormente",
      });
    }

    await query(`
      UPDATE users 
      SET email_verified = NOW(), confirmation_token = NULL, updated_at = NOW()
      WHERE id = $1
    `, [user.id]);

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