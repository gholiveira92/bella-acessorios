import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`;
    return NextResponse.json({ columns: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await prisma.$executeRaw`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified TIMESTAMP;`;
    await prisma.$executeRaw`ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token TEXT;`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}