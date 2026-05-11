"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle } from "react-icons/fi";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "BELLA-ABC123",
    status: "PAGO",
    total: 159.8,
    createdAt: "2024-01-15T10:30:00Z",
    items: [
      { name: "Anel Casulo Dourado", quantity: 1, price: 69.9 },
      { name: "Brinco Ponto de Luz", quantity: 2, price: 89.9 },
    ],
  },
  {
    id: "2",
    orderNumber: "BELLA-DEF456",
    status: "ENVIADO",
    total: 99.9,
    createdAt: "2024-01-10T14:20:00Z",
    items: [
      { name: "Colar Gargantilha", quantity: 1, price: 99.9 },
    ],
  },
  {
    id: "3",
    orderNumber: "BELLA-GHI789",
    status: "ENTREGUE",
    total: 149.8,
    createdAt: "2024-01-05T09:15:00Z",
    items: [
      { name: "Pulseira Berloque", quantity: 1, price: 79.9 },
      { name: "Tornozeleira Dourada", quantity: 1, price: 39.9 },
      { name: "Anel Coração", quantity: 1, price: 30 },
    ],
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  AGUARDANDO_PAGAMENTO: { label: "Aguardando Pagamento", color: "text-yellow-600 bg-yellow-50", icon: <FiClock /> },
  PAGO: { label: "Pago", color: "text-blue-600 bg-blue-50", icon: <FiCheckCircle /> },
  EM_SEPARACAO: { label: "Em Separação", color: "text-orange-600 bg-orange-50", icon: <FiPackage /> },
  ENVIADO: { label: "Enviado", color: "text-purple-600 bg-purple-50", icon: <FiTruck /> },
  ENTREGUE: { label: "Entregue", color: "text-green-600 bg-green-50", icon: <FiCheckCircle /> },
  CANCELADO: { label: "Cancelado", color: "text-red-600 bg-red-50", icon: <FiXCircle /> },
};

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/auth/login";
      return;
    }

    if (status === "authenticated") {
      setTimeout(() => {
        setOrders(mockOrders);
        setLoading(false);
      }, 500);
    }
  }, [status]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif text-rose-800 mb-8">Meus Pedidos</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-800 mb-2">Nenhum pedido encontrado</h2>
            <p className="text-gray-500 mb-8">Faça seu primeiro pedido em nossa loja!</p>
            <Link
              href="/catalog"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full hover:bg-rose-700 transition-colors"
            >
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = statusConfig[order.status] || { label: order.status, color: "text-gray-600 bg-gray-50", icon: <FiPackage /> };

              return (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Pedido</p>
                      <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data</p>
                      <p className="text-gray-800">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-semibold text-rose-600">
                        R$ {order.total.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="text-sm font-medium">{statusInfo.label}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">Itens:</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-gray-700 text-sm">
                          {item.name} x{item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-4">
                    <button className="text-rose-600 hover:underline text-sm">
                      Ver Detalhes
                    </button>
                    {order.status === "ENVIADO" && (
                      <button className="text-rose-600 hover:underline text-sm">
                        Rastrear
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}