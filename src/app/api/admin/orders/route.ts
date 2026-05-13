import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db-direct";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
    }

    const orders = await query(
      `SELECT o.id, o.order_number, o.status, o.subtotal, o.shipping_price, o.total,
              o.shipping_provider, o.shipping_deadline, o.created_at,
              u.name as customer_name, u.email as customer_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 50`
    );

    const statusCounts = await query(
      `SELECT status, COUNT(*)::int as count FROM orders GROUP BY status`
    );

    const statusMap: Record<string, number> = {};
    for (const row of statusCounts as any[]) {
      statusMap[row.status] = row.count;
    }

    const totalRevenue = await query(
      `SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status = 'PAGO'`
    );

    return NextResponse.json({
      orders: (orders as any[]).map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        customer: o.customer_name,
        email: o.customer_email,
        total: parseFloat(o.total),
        status: o.status,
        createdAt: o.created_at,
      })),
      stats: {
        totalOrders: Object.values(statusMap).reduce((a: number, b: number) => a + b, 0),
        pendingOrders: statusMap["AGUARDANDO_PAGAMENTO"] || 0,
        paidOrders: statusMap["PAGO"] || 0,
        shippedOrders: statusMap["ENVIADO"] || 0,
        deliveredOrders: statusMap["ENTREGUE"] || 0,
        revenue: parseFloat((totalRevenue as any[])[0]?.revenue || 0),
      },
    });
  } catch (error: any) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, tracking } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do pedido é obrigatório" }, { status: 400 });
    }

    await query(
      `UPDATE orders SET status = $1, shipping_tracking = $2, updated_at = NOW() WHERE id = $3`,
      [status, tracking || null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}