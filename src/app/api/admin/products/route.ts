import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";

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

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (category && category !== "all") {
      where.category = { slug: category };
    }

    if (stock === "low") {
      where.stock = { lte: 5 };
    } else if (stock === "out") {
      where.stock = 0;
    }

    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { isMain: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        promotionalPrice: p.promotionalPrice,
        stock: p.stock,
        active: p.active,
        category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
        images: p.images.map((img) => ({ id: img.id, url: img.url, isMain: img.isMain })),
        createdAt: p.createdAt.toISOString(),
      })),
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
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

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        promotionalPrice: promotionalPrice ? parseFloat(promotionalPrice) : null,
        stock: parseInt(stock) || 0,
        categoryId: categoryId || null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        width: width ? parseFloat(width) : null,
        length: length ? parseFloat(length) : null,
        active: active !== false,
      },
    });

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: images[i],
            isMain: i === 0,
            order: i,
          },
        });
      }
    }

    if (variations && variations.length > 0) {
      for (const variation of variations) {
        if (variation.name && variation.value) {
          await prisma.productVariation.create({
            data: {
              productId: product.id,
              name: variation.name,
              value: variation.value,
              stock: variation.stock || 0,
              price: variation.price ? parseFloat(variation.price) : null,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id,
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
      variations,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(promotionalPrice !== undefined && { promotionalPrice: promotionalPrice ? parseFloat(promotionalPrice) : null }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(height !== undefined && { height: height ? parseFloat(height) : null }),
        ...(width !== undefined && { width: width ? parseFloat(width) : null }),
        ...(length !== undefined && { length: length ? parseFloat(length) : null }),
        ...(active !== undefined && { active }),
      },
    });

    if (variations && Array.isArray(variations)) {
      const existingVariations = await prisma.productVariation.findMany({
        where: { productId: id },
      });
      
      const existingIds = existingVariations.map(v => v.id);
      const newIds = variations.filter(v => v.id).map(v => v.id);
      
      const toDelete = existingIds.filter(id => !newIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.productVariation.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
      
      for (const variation of variations) {
        if (variation.id) {
          await prisma.productVariation.update({
            where: { id: variation.id },
            data: {
              name: variation.name,
              value: variation.value,
              stock: variation.stock || 0,
              price: variation.price ? parseFloat(variation.price) : null,
            },
          });
        } else if (variation.name && variation.value) {
          await prisma.productVariation.create({
            data: {
              productId: id,
              name: variation.name,
              value: variation.value,
              stock: variation.stock || 0,
              price: variation.price ? parseFloat(variation.price) : null,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
      },
    });
  } catch (error) {
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

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}