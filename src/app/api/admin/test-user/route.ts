import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db-direct";

export async function GET() {
  try {
    const passwordHash = await bcrypt.hash("teste123", 10);
    
    const result = await query(`
      INSERT INTO users (id, name, email, password_hash, cpf, gender, phone, role, created_at, updated_at)
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET password_hash = $3, updated_at = NOW()
      RETURNING id, email
    `, ["Teste Admin", "admin@teste.com", passwordHash, "11144477736", "MASCULINO", "11999999999", "ADMIN"]);

    return NextResponse.json({ success: true, user: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}