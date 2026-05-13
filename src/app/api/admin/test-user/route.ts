import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const passwordHash = await bcrypt.hash("teste123", 10);
    
    const user = await prisma.user.create({
      data: {
        name: "Teste Admin",
        email: "admin@teste.com",
        passwordHash,
        cpf: "11144477736",
        gender: "MASCULINO",
        phone: "11999999999",
        role: "ADMIN",
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}