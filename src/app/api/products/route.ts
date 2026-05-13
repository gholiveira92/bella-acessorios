import { NextResponse } from "next/server";
import { query } from "@/lib/db-direct";

export async function GET(request: Request) {
  try {
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

    const productsSql = `
      SELECT p.id, p.name, p.slug, p.description, p.price, p.promotional_price, p.stock,
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${sqlWhere}
      GROUP BY p.id, c.id
      ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countSql = `SELECT COUNT(*)::int as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${sqlWhere}`;

    const categoriesSql = `SELECT id, name, slug FROM categories ORDER BY name`;

    // Execute queries
    const products = await query(productsSql, params);
    const countResult = await query(countSql, params);
    const categories = await query(categoriesSql);

    // Get images for products
    const productIds = products.map((p: any) => p.id);
    let imagesMap: Record<string, any[]> = {};
    
    if (productIds.length > 0) {
      const placeholders = productIds.map((_, i) => `$${i + 1}`).join(",");
      const imagesResult = await query(
        `SELECT product_id, id, url, is_main FROM product_images WHERE product_id IN (${placeholders}) ORDER BY is_main DESC, id`,
        productIds
      );
      
      for (const img of imagesResult as any[]) {
        if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
        imagesMap[img.product_id].push({
          id: img.id,
          url: img.url,
          isMain: img.is_main,
        });
      }
    }

    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      products: products.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: parseFloat(p.price),
        promotionalPrice: p.promotional_price ? parseFloat(p.promotional_price) : null,
        stock: p.stock,
        category: p.cat_id ? { id: p.cat_id, name: p.cat_name, slug: p.cat_slug } : null,
        images: imagesMap[p.id] || [],
      })),
      categories: categories.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });

  } catch (error: any) {
    console.error("Products error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos", details: error.message },
      { status: 500 }
    );
  }
}