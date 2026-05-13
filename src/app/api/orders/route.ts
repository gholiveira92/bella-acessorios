import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db-direct";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const orders = await query(
      `SELECT o.id, o.order_number, o.status, o.subtotal, o.shipping_price, o.total,
              o.shipping_provider, o.shipping_deadline, o.created_at,
              json_agg(json_build_object(
                'name', oi.product_name,
                'quantity', oi.quantity,
                'price', oi.unit_price
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json({
      orders: (orders as any[]).map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        total: parseFloat(order.total),
        shippingProvider: order.shipping_provider,
        shippingDeadline: order.shipping_deadline,
        createdAt: order.created_at,
        items: order.items.filter((i: any) => i.name), // filter out null items
      })),
    });
  } catch (error: any) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }
}