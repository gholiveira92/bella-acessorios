import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db-direct";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ items: [] });
    }

    const cartResult = await query(`
      SELECT id FROM carts WHERE user_id = $1 LIMIT 1
    `, [session.user.id]);

    if (cartResult.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const cartId = (cartResult[0] as any).id;

    const itemsResult = await query(`
      SELECT ci.id, ci.product_id, ci.quantity, ci.unit_price,
             p.name, p.price, p.promotional_price, p.stock,
             (SELECT url FROM product_images WHERE product_id = p.id AND is_main = true LIMIT 1) as image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);

    return NextResponse.json({
      items: (itemsResult as any[]).map((item) => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        price: parseFloat(item.price),
        promotionalPrice: item.promotional_price ? parseFloat(item.promotional_price) : null,
        quantity: item.quantity,
        image: item.image || "",
      })),
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, quantity, unitPrice } = body;

    if (!productId || !quantity || !unitPrice) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const cartResult = await query(`SELECT id FROM carts WHERE user_id = $1 LIMIT 1`, [session.user.id]);

    let cartId;
    if (cartResult.length === 0) {
      const newCart = await query(`
        INSERT INTO carts (id, user_id, created_at, updated_at)
        VALUES (gen_random_uuid()::text, $1, NOW(), NOW())
        RETURNING id
      `, [session.user.id]);
      cartId = newCart[0].id;
    } else {
      cartId = (cartResult[0] as any).id;
    }

    const existingItemResult = await query(`
      SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2 LIMIT 1
    `, [cartId, productId]);

    if (existingItemResult.length > 0) {
      const existingItem = existingItemResult[0] as any;
      await query(`
        UPDATE cart_items SET quantity = quantity + $1, unit_price = $2 WHERE id = $3
      `, [quantity, unitPrice, existingItem.id]);
    } else {
      await query(`
        INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price, created_at)
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
      `, [cartId, productId, quantity, unitPrice]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar ao carrinho" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item não especificado" },
        { status: 400 }
      );
    }

    await query(`DELETE FROM cart_items WHERE id = $1`, [itemId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { error: "Erro ao remover item" },
      { status: 500 }
    );
  }
}