import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
    }

    const prisma = new PrismaClient();
    
    await prisma.$executeRaw`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token TEXT;
    `;

    return NextResponse.json({ success: true, message: "Banco sincronizado" });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Erro ao sincronizar" }, { status: 500 });
  }
}