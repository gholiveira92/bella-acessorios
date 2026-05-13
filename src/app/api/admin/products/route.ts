import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db-direct";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const stock = searchParams.get("stock");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let sqlWhere = "WHERE p.active = true";
    const params: any[] = [];
    let p = 1;

    if (search) {
      sqlWhere += ` AND (p.name ILIKE $${p++} OR p.description ILIKE $${p++})`;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    if (category && category !== "all") {
      sqlWhere += ` AND c.slug = $${p++}`;
      params.push(category);
    }

    if (stock === "low") {
      sqlWhere += ` AND p.stock <= 5`;
    } else if (stock === "out") {
      sqlWhere += ` AND p.stock = 0`;
    }

    const offset = (page - 1) * limit;

    const productsSql = `
      SELECT p.id, p.name, p.slug, p.description, p.price, p.promotional_price, p.stock, p.active,
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug,
             p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${sqlWhere}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countSql = `SELECT COUNT(*)::int as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${sqlWhere}`;

    const categoriesSql = `SELECT id, name, slug FROM categories ORDER BY name`;

    const products = await query(productsSql, params);
    const countResult = await query(countSql, params);
    const categories = await query(categoriesSql);

    // Get images for products
    const productIds = (products as any[]).map((p: any) => p.id);
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
      products: (products as any[]).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: parseFloat(p.price),
        promotionalPrice: p.promotional_price ? parseFloat(p.promotional_price) : null,
        stock: p.stock,
        active: p.active,
        category: p.cat_id ? { id: p.cat_id, name: p.cat_name, slug: p.cat_slug } : null,
        images: imagesMap[p.id] || [],
        createdAt: p.created_at,
      })),
      categories: (categories as any[]).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin products error:", error);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      promotionalPrice, 
      stock, 
      categoryId,
      weight,
      height,
      width,
      length,
      active,
      images,
      variations,
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim() + "-" + Date.now().toString(36);

    const productId = (await query(
      `INSERT INTO products (id, name, slug, description, price, promotional_price, stock, category_id, weight, height, width, length, active, created_at, updated_at)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING id`,
      [
        name,
        slug,
        description || null,
        parseFloat(price),
        promotionalPrice ? parseFloat(promotionalPrice) : null,
        parseInt(stock) || 0,
        categoryId || null,
        weight ? parseFloat(weight) : null,
        height ? parseFloat(height) : null,
        width ? parseFloat(width) : null,
        length ? parseFloat(length) : null,
        active !== false,
      ]
    ))[0] as any;

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await query(
          `INSERT INTO product_images (id, product_id, url, is_main, "order", created_at)
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
          [productId.id, images[i], i === 0, i]
        );
      }
    }

    if (variations && variations.length > 0) {
      for (const variation of variations) {
        if (variation.name && variation.value) {
          await query(
            `INSERT INTO product_variations (id, product_id, name, value, stock, price, created_at)
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW())`,
            [productId.id, variation.name, variation.value, variation.stock || 0, variation.price ? parseFloat(variation.price) : null]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      product: {
        id: productId.id,
        name,
        slug,
      },
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Erro ao criar produto", details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, price, promotionalPrice, stock, categoryId, weight, height, width, length, active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    const updates: string[] = [];
    const params: any[] = [];
    let p = 1;

    if (name) {
      updates.push(`name = $${p++}`);
      params.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${p++}`);
      params.push(description);
    }
    if (price) {
      updates.push(`price = $${p++}`);
      params.push(parseFloat(price));
    }
    if (promotionalPrice !== undefined) {
      updates.push(`promotional_price = $${p++}`);
      params.push(promotionalPrice ? parseFloat(promotionalPrice) : null);
    }
    if (stock !== undefined) {
      updates.push(`stock = $${p++}`);
      params.push(parseInt(stock));
    }
    if (categoryId !== undefined) {
      updates.push(`category_id = $${p++}`);
      params.push(categoryId || null);
    }
    if (weight !== undefined) {
      updates.push(`weight = $${p++}`);
      params.push(weight ? parseFloat(weight) : null);
    }
    if (height !== undefined) {
      updates.push(`height = $${p++}`);
      params.push(height ? parseFloat(height) : null);
    }
    if (width !== undefined) {
      updates.push(`width = $${p++}`);
      params.push(width ? parseFloat(width) : null);
    }
    if (length !== undefined) {
      updates.push(`length = $${p++}`);
      params.push(length ? parseFloat(length) : null);
    }
    if (active !== undefined) {
      updates.push(`active = $${p++}`);
      params.push(active);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    if (updates.length > 1) {
      await query(`UPDATE products SET ${updates.join(", ")} WHERE id = $${p}`, params);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    await query(`DELETE FROM products WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}