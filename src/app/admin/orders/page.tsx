"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiSearch, FiEye, FiPackage, FiTruck } from "react-icons/fi";
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

const mockOrders: Order[] = [
  { id: "1", orderNumber: "BELLA-ABC123", customer: "Maria Silva", email: "maria@email.com", total: 159.8, status: "PAGO", paymentMethod: "PIX", createdAt: "2024-01-15" },
  { id: "2", orderNumber: "BELLA-DEF456", customer: "João Santos", email: "joao@email.com", total: 89.9, status: "AGUARDANDO_PAGAMENTO", paymentMethod: "Cartão", createdAt: "2024-01-15" },
  { id: "3", orderNumber: "BELLA-GHI789", customer: "Ana Costa", email: "ana@email.com", total: 249.7, status: "ENVIADO", paymentMethod: "PIX", createdAt: "2024-01-14" },
  { id: "4", orderNumber: "BELLA-JKL012", customer: "Pedro Oliveira", email: "pedro@email.com", total: 79.9, status: "EM_SEPARACAO", paymentMethod: "Cartão", createdAt: "2024-01-14" },
  { id: "5", orderNumber: "BELLA-MNO345", customer: "Julia Lima", email: "julia@email.com", total: 199.8, status: "ENTREGUE", paymentMethod: "PIX", createdAt: "2024-01-13" },
];

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
  const [orders] = useState(mockOrders);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
      order.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    console.log(`Update order ${orderId} to ${newStatus}`);
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Pedidos</h1>
        <p className="text-gray-500">Gerencie os pedidos da loja</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por pedido ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-rose-600">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800">{order.customer}</p>
                    <p className="text-xs text-gray-500">{order.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">R$ {order.total.toFixed(2).replace(".", ",")}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className={`text-xs font-medium rounded-full border-0 cursor-pointer px-2 py-1 ${statusColors[order.status]}`}
                    >
                      {statusOptions.slice(1).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.createdAt}</td>
                  <td className="px-6 py-4">
                    <button className="p-1 text-gray-400 hover:text-rose-600" title="Ver Detalhes">
                      <FiEye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}