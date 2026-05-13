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

    const [
      totalOrdersResult,
      pendingOrdersResult,
      paidOrdersResult,
      shippedOrdersResult,
      deliveredOrdersResult,
      revenueResult,
      productsResult,
      usersResult,
    ] = await Promise.all([
      query(`SELECT COUNT(*)::int as count FROM orders`),
      query(`SELECT COUNT(*)::int as count FROM orders WHERE status = 'AGUARDANDO_PAGAMENTO'`),
      query(`SELECT COUNT(*)::int as count FROM orders WHERE status = 'PAGO'`),
      query(`SELECT COUNT(*)::int as count FROM orders WHERE status = 'ENVIADO'`),
      query(`SELECT COUNT(*)::int as count FROM orders WHERE status = 'ENTREGUE'`),
      query(`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status IN ('PAGO', 'ENVIADO', 'ENTREGUE')`),
      query(`SELECT COUNT(*)::int as count FROM products WHERE active = true`),
      query(`SELECT COUNT(*)::int as count FROM users`),
    ]);

    const recentOrders = await query(`
      SELECT o.id, o.order_number, o.total, o.status, o.created_at,
             u.name, u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    const lowStockResult = await query(
      `SELECT COUNT(*)::int as count FROM products WHERE stock <= 5 AND active = true`
    );

    const totalOrders = totalOrdersResult[0]?.count || 0;
    const pendingOrders = pendingOrdersResult[0]?.count || 0;
    const paidOrders = paidOrdersResult[0]?.count || 0;
    const shippedOrders = shippedOrdersResult[0]?.count || 0;
    const deliveredOrders = deliveredOrdersResult[0]?.count || 0;
    const revenue = parseFloat(revenueResult[0]?.total || "0");
    const products = productsResult[0]?.count || 0;
    const users = usersResult[0]?.count || 0;
    const lowStockProducts = lowStockResult[0]?.count || 0;

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        paidOrders,
        shippedOrders,
        deliveredOrders,
        revenue,
        totalProducts: products,
        totalUsers: users,
        lowStockProducts,
      },
      recentOrders: (recentOrders as any[]).map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        customer: order.name,
        email: order.email,
        total: parseFloat(order.total),
        status: order.status,
        createdAt: order.created_at,
      })),
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}