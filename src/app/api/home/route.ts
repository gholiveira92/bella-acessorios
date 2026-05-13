import { NextResponse } from "next/server";
import { query } from "@/lib/db-direct";

export async function GET() {
  try {
    const categories = await query(`
      SELECT id, name, slug, image
      FROM categories
      WHERE active = true
      ORDER BY name
    `);

    const products = await query(`
      SELECT p.id, p.name, p.slug, p.price, p.promotional_price, p.stock, p.active,
             c.name as category_name, c.slug as category_slug,
             (SELECT url FROM product_images WHERE product_id = p.id AND is_main = true LIMIT 1) as image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = true
      ORDER BY p.created_at DESC
    `);

    const featuredProducts = (products as any[])
      .filter((p) => p.image)
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: parseFloat(p.price),
        promotionalPrice: p.promotional_price ? parseFloat(p.promotional_price) : null,
        image: p.image,
        category: p.category_name,
      }));

    const newestProducts = (products as any[])
      .filter((p) => p.image)
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: parseFloat(p.price),
        promotionalPrice: p.promotional_price ? parseFloat(p.promotional_price) : null,
        image: p.image,
        category: p.category_name,
      }));

    return NextResponse.json({
      featuredCategories: (categories as any[]).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image || getCategoryImage(c.slug),
      })),
      featuredProducts,
      newestProducts,
    });
  } catch (error) {
    console.error("Home API error:", error);
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}

function getCategoryImage(slug: string): string {
  const images: Record<string, string> = {
   aneis: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
    brincos: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
    colares: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
    pulseiras: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=400&fit=crop",
    tornozeleiras: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop",
  };
  return images[slug] || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop";
}