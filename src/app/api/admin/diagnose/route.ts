import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    databaseUrl: process.env.DATABASE_URL ? "Configurada" : "Não encontrada",
    urlPreview: process.env.DATABASE_URL?.substring(0, 50) + "...",
  });
}