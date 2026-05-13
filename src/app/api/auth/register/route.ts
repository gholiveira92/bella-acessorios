import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db-direct";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, cpf, gender, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const cpfValue = cpf && cpf.length === 11 ? cpf : "00000000000";
    const phoneValue = phone && phone.length >= 10 ? phone : null;

    await query(
      `INSERT INTO users (id, name, email, password_hash, cpf, gender, phone, role, email_verified, created_at, updated_at)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, 'CLIENT', NOW(), NOW(), NOW())`,
      [name, email, passwordHash, cpfValue, gender || "F", phoneValue]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Register error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    return NextResponse.json({ error: "Erro ao cadastrar", details: error.message }, { status: 500 });
  }
}