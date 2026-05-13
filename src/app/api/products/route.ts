import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(request: Request) {
  // Create fresh Prisma client for each request to avoid prepared statement issues
  const prisma = new PrismaClient({
    log: ["error"],
  });

  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: any = { active: true };
    
    if (category && category !== "todos") {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { isMain: "desc" }, take: 1 },
        },
        orderBy: sort === "price-asc" 
          ? { price: "asc" } 
          : sort === "price-desc" 
          ? { price: "desc" } 
          : { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      promotionalPrice: p.promotionalPrice,
      stock: p.stock,
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
      images: p.images.map((img) => ({ id: img.id, url: img.url, isMain: img.isMain })),
    }));

    return NextResponse.json({
      products: formattedProducts,
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}