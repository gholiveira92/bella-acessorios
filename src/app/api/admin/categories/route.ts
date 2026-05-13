import { NextResponse } from "next/server";
import { query } from "@/lib/db-direct";

export async function GET() {
  try {
    const categories = await query(
      `SELECT id, name, slug, image, active, created_at FROM categories ORDER BY name`
    );

    return NextResponse.json({
      categories: (categories as any[]).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        active: c.active,
        createdAt: c.created_at,
      })),
    });
  } catch (error: any) {
    console.error("Categories error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar categorias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, image, active } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();

    const result = await query(
      `INSERT INTO categories (id, name, slug, image, active, created_at, updated_at)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())
       RETURNING id, name, slug`,
      [name, `${slug}-${Date.now().toString(36)}`, image || null, active !== false]
    );

    return NextResponse.json({ success: true, category: result[0] });
  } catch (error: any) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, image, active } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID e nome são obrigatórios" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();

    await query(
      `UPDATE categories SET name = $1, slug = $2, image = $3, active = $4, updated_at = NOW()
       WHERE id = $5`,
      [name, slug, image || null, active !== false, id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar categoria" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await query(`DELETE FROM categories WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Erro ao excluir categoria" },
      { status: 500 }
    );
  }
}