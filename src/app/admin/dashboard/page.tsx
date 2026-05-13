"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiShoppingBag, FiPackage, FiDollarSign, FiAlertTriangle, FiUsers, FiBox } from "react-icons/fi";
import AdminLayout from "@/components/layout/AdminLayout";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  revenue: number;
  totalProducts: number;
  totalUsers: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "bg-yellow-100 text-yellow-800",
  PAGO: "bg-blue-100 text-blue-800",
  EM_SEPARACAO: "bg-orange-100 text-orange-800",
  ENVIADO: "bg-purple-100 text-purple-800",
  ENTREGUE: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchStats();
    }
  }, [status, session]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      
      if (res.ok) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || !session || loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <p className="text-text-muted">Acesso negado</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-text-primary">Dashboard</h1>
        <p className="text-text-muted">Bem-vindo ao painel administrativo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-brand-bg-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Total de Pedidos</p>
              <p className="text-2xl font-semibold text-text-primary">{stats?.totalOrders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-brand-gold/10 rounded-lg flex items-center justify-center">
              <FiShoppingBag className="text-brand-gold text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-brand-bg-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Pedidos Pendentes</p>
              <p className="text-2xl font-semibold text-text-primary">{stats?.pendingOrders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiPackage className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-brand-bg-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Faturamento Total</p>
              <p className="text-2xl font-semibold text-text-primary">
                R$ {(stats?.revenue || 0).toFixed(2).replace(".", ",")}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-brand-bg-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Estoque Baixo</p>
              <p className="text-2xl font-semibold text-text-primary">{stats?.lowStockProducts || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-brand-bg-dark">
          <div className="flex items-center gap-2 mb-4">
            <FiBox className="text-brand-gold" />
            <span className="font-medium text-text-primary">Produtos e Usuários</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-brand-bg-light rounded-lg">
              <p className="text-3xl font-bold text-brand-gold">{stats?.totalProducts || 0}</p>
              <p className="text-sm text-text-muted">Produtos</p>
            </div>
            <div className="text-center p-4 bg-brand-bg-light rounded-lg">
              <p className="text-3xl font-bold text-brand-gold">{stats?.totalUsers || 0}</p>
              <p className="text-sm text-text-muted">Usuários</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-brand-bg-dark">
          <div className="flex items-center gap-2 mb-4">
            <FiPackage className="text-brand-gold" />
            <span className="font-medium text-text-primary">Status dos Pedidos</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-lg font-bold text-yellow-700">{stats?.pendingOrders || 0}</p>
              <p className="text-xs text-yellow-600">Aguardando</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-bold text-blue-700">{stats?.paidOrders || 0}</p>
              <p className="text-xs text-blue-600">Pagos</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-lg font-bold text-purple-700">{stats?.shippedOrders || 0}</p>
              <p className="text-xs text-purple-600">Enviados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brand-bg-dark">
        <div className="p-6 border-b border-brand-bg-dark">
          <h2 className="text-lg font-semibold text-text-primary">Pedidos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-bg-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg-dark">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-bg-light">
                    <td className="px-6 py-4 text-sm font-medium text-brand-gold">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">R$ {order.total.toFixed(2).replace(".", ",")}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}