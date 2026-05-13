import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
    }

    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      shippedOrders,
      deliveredOrders,
      revenue,
      products,
      users,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "AGUARDANDO_PAGAMENTO" } }),
      prisma.order.count({ where: { status: "PAGO" } }),
      prisma.order.count({ where: { status: "ENVIADO" } }),
      prisma.order.count({ where: { status: "ENTREGUE" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["PAGO", "ENVIADO", "ENTREGUE"] } },
      }),
      prisma.product.count(),
      prisma.user.count(),
    ]);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const lowStockProducts = await prisma.product.count({
      where: { stock: { lte: 5 }, active: true },
    });

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        paidOrders,
        shippedOrders,
        deliveredOrders,
        revenue: revenue._sum.total || 0,
        totalProducts: products,
        totalUsers: users,
        lowStockProducts,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.user.name,
        email: order.user.email,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}