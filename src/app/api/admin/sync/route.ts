import { NextResponse } from "next/server";
import { query } from "@/lib/db-direct";

export async function GET() {
  try {
    const columnsResult = await query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'payments'
    `);
    return NextResponse.json({ columns: columnsResult });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS webhook_token TEXT;`);
    return NextResponse.json({ success: true, message: "Coluna webhook_token adicionada" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}