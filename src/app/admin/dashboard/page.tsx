"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiShoppingBag, FiPackage, FiDollarSign, FiAlertTriangle } from "react-icons/fi";
import AdminLayout from "@/components/layout/AdminLayout";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  shippedOrders: number;
  revenue: number;
  lowStockProducts: number;
}

const mockStats: Stats = {
  totalOrders: 156,
  pendingOrders: 12,
  paidOrders: 45,
  shippedOrders: 89,
  revenue: 24580.5,
  lowStockProducts: 5,
};

const recentOrders = [
  { id: "1", orderNumber: "BELLA-ABC123", customer: "Maria Silva", total: 159.8, status: "PAGO", date: "2024-01-15" },
  { id: "2", orderNumber: "BELLA-DEF456", customer: "João Santos", total: 89.9, status: "AGUARDANDO_PAGAMENTO", date: "2024-01-15" },
  { id: "3", orderNumber: "BELLA-GHI789", customer: "Ana Costa", total: 249.7, status: "ENVIADO", date: "2024-01-14" },
  { id: "4", orderNumber: "BELLA-JKL012", customer: "Pedro Oliveira", total: 79.9, status: "EM_SEPARACAO", date: "2024-01-14" },
];

const statusColors: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "bg-yellow-100 text-yellow-800",
  PAGO: "bg-blue-100 text-blue-800",
  EM_SEPARACAO: "bg-orange-100 text-orange-800",
  ENVIADO: "bg-purple-100 text-purple-800",
  ENTREGUE: "bg-green-100 text-green-800",
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>(mockStats);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo ao painel administrativo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Pedidos</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
              <FiShoppingBag className="text-rose-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pedidos Pendentes</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiPackage className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Faturamento Total</p>
              <p className="text-2xl font-semibold text-gray-800">R$ {stats.revenue.toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Estoque Baixo</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.lowStockProducts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Pedidos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-rose-600">{order.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">R$ {order.total.toFixed(2).replace(".", ",")}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}