import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  return new PrismaClient({
    log: ["error"],
  });
}

export async function GET(request: Request) {
  let prisma;
  
  try {
    prisma = createPrismaClient();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    let sqlWhere = "WHERE p.active = true";
    const params: (string | number)[] = [];
    let p = 1;

    if (category && category !== "todos") {
      sqlWhere += ` AND c.slug = $${p++}`;
      params.push(category);
    }

    if (search) {
      sqlWhere += ` AND (p.name ILIKE $${p++} OR p.description ILIKE $${p++})`;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    const orderBy = sort === "price-asc" 
      ? "ORDER BY COALESCE(p.promotional_price, p.price) ASC" 
      : sort === "price-desc" 
      ? "ORDER BY COALESCE(p.promotional_price, p.price) DESC" 
      : "ORDER BY p.created_at DESC";

    const offset = (page - 1) * limit;

    // Raw SQL with parameters using $1, $2, etc.
    const productsSql = `
      SELECT p.id, p.name, p.slug, p.description, p.price, p.promotional_price, p.stock,
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug,
             (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.url, 'isMain', pi.is_main) ORDER BY pi.is_main DESC)
              FROM product_images pi WHERE pi.product_id = p.id) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${sqlWhere}
      GROUP BY p.id, c.id
      ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countSql = `SELECT COUNT(*)::int as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${sqlWhere}`;

    const categoriesSql = `SELECT id, name, slug FROM categories ORDER BY name`;

    // Use $queryRawUnsafe with proper parameter mapping
    const products = await (prisma as any).$queryRawUnsafe(productsSql, ...params);
    const countResult = await (prisma as any).$queryRawUnsafe(countSql, ...params);
    const categories = await (prisma as any).$queryRawUnsafe(categoriesSql);

    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      products: (products as any[]).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: parseFloat(p.price),
        promotionalPrice: p.promotional_price ? parseFloat(p.promotional_price) : null,
        stock: p.stock,
        category: p.cat_id ? { id: p.cat_id, name: p.cat_name, slug: p.cat_slug } : null,
        images: (p.images as any[])?.filter((i: any) => i?.id) || [],
      })),
      categories: (categories as any[]).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });

  } catch (error: any) {
    console.error("Products error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos", details: error.message },
      { status: 500 }
    );
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}