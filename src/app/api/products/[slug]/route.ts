import { NextResponse } from "next/server";
import { query } from "@/lib/db-direct";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const productsSql = `
      SELECT p.id, p.name, p.slug, p.description, p.price, p.promotional_price, p.stock,
             p.weight, p.height, p.width, p.length,
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.active = true
    `;

    const products = await query(productsSql, [slug]);

    if (products.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const product = products[0] as any;

    // Get images
    const images = await query(
      `SELECT id, url, is_main FROM product_images WHERE product_id = $1 ORDER BY is_main DESC, id`,
      [product.id]
    );

    // Get variations
    const variations = await query(
      `SELECT id, name, value, stock, price FROM product_variations WHERE product_id = $1`,
      [product.id]
    );

    // Get related products (same category)
    const relatedProducts = await query(
      `SELECT p.id, p.name, p.slug, p.price, p.promotional_price
       FROM products p
       WHERE p.category_id = $1 AND p.id != $2 AND p.active = true
       LIMIT 4`,
      [product.category_id, product.id]
    );

    // Group variations by type
    const variationsByType: Record<string, any[]> = {};
    for (const v of variations as any[]) {
      if (!variationsByType[v.name]) variationsByType[v.name] = [];
      variationsByType[v.name].push(v);
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: parseFloat(product.price),
        promotionalPrice: product.promotional_price ? parseFloat(product.promotional_price) : null,
        stock: product.stock,
        weight: product.weight,
        height: product.height,
        width: product.width,
        length: product.length,
        category: { id: product.cat_id, name: product.cat_name, slug: product.cat_slug },
        images: (images as any[]).map((i: any) => ({ id: i.id, url: i.url, isMain: i.is_main })),
        variations: (variations as any[]).map((v: any) => ({ id: v.id, name: v.name, value: v.value, stock: v.stock, price: v.price })),
        variationTypes: Object.keys(variationsByType),
        relatedProducts: (relatedProducts as any[]).map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: parseFloat(p.price),
          promotionalPrice: p.promotional_price ? parseFloat(p.promotional_price) : null,
        })),
      },
    });

  } catch (error: any) {
    console.error("Product error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produto", details: error.message },
      { status: 500 }
    );
  }
}