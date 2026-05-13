"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiSearch, FiEye, FiPackage, FiTruck, FiCheckCircle } from "react-icons/fi";
import AdminLayout from "@/components/layout/AdminLayout";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "AGUARDANDO_PAGAMENTO", label: "Aguardando Pagamento" },
  { value: "PAGO", label: "Pago" },
  { value: "EM_SEPARACAO", label: "Em Separação" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "ENTREGUE", label: "Entregue" },
  { value: "CANCELADO", label: "Cancelado" },
];

const statusColors: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "bg-yellow-100 text-yellow-800",
  PAGO: "bg-blue-100 text-blue-800",
  EM_SEPARACAO: "bg-orange-100 text-orange-800",
  ENVIADO: "bg-purple-100 text-purple-800",
  ENTREGUE: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchOrders();
    }
  }, [status, session, search, statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
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
        <h1 className="text-2xl font-serif text-text-primary">Pedidos</h1>
        <p className="text-text-muted">Gerencie os pedidos da loja</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brand-bg-dark">
        <div className="p-4 border-b border-brand-bg-dark flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por pedido ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-bg-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg-dark">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-bg-light">
                    <td className="px-6 py-4 text-sm font-medium text-brand-gold">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-primary">{order.customer}</p>
                      <p className="text-xs text-text-muted">{order.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">R$ {order.total.toFixed(2).replace(".", ",")}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{order.paymentMethod || "PIX"}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={`text-xs font-medium rounded-full border-0 cursor-pointer px-2 py-1 ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}
                      >
                        {statusOptions.slice(1).map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <button className="p-1 text-text-muted hover:text-brand-gold" title="Ver Detalhes">
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
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