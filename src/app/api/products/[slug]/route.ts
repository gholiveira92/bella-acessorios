import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { isMain: "desc" } },
        variations: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        active: true,
      },
      take: 4,
      include: {
        images: { where: { isMain: true }, take: 1 },
      },
    });

    const variationsByType = product.variations.reduce((acc, v) => {
      if (!acc[v.name]) {
        acc[v.name] = [];
      }
      acc[v.name].push(v);
      return acc;
    }, {} as Record<string, typeof product.variations>);

    return NextResponse.json({ 
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        promotionalPrice: product.promotionalPrice,
        stock: product.stock,
        weight: product.weight,
        height: product.height,
        width: product.width,
        length: product.length,
        category: product.category ? { 
          id: product.category.id, 
          name: product.category.name, 
          slug: product.category.slug 
        } : null,
        images: product.images.map((img) => ({
          id: img.id,
          url: img.url,
          isMain: img.isMain,
        })),
        variations: product.variations.map((v) => ({
          id: v.id,
          name: v.name,
          value: v.value,
          stock: v.stock,
          price: v.price,
        })),
        variationTypes: Object.keys(variationsByType),
        relatedProducts: relatedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          promotionalPrice: p.promotionalPrice,
          image: p.images[0]?.url || "",
        })),
      }
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
      { status: 500 }
    );
  }
}