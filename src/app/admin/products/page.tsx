"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye } from "react-icons/fi";
import AdminLayout from "@/components/layout/AdminLayout";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  image: string;
}

const mockProducts: Product[] = [
  { id: "1", name: "Anel Casulo Dourado", category: "Anéis", price: 89.9, stock: 15, active: true, image: "https://placehold.co/100x100" },
  { id: "2", name: "Brinco Ponto de Luz", category: "Brincos", price: 59.9, stock: 20, active: true, image: "https://placehold.co/100x100" },
  { id: "3", name: "Colar Gargantilha", category: "Colares", price: 129.9, stock: 10, active: true, image: "https://placehold.co/100x100" },
  { id: "4", name: "Pulseira Berloque", category: "Pulseiras", price: 79.9, stock: 12, active: true, image: "https://placehold.co/100x100" },
  { id: "5", name: "Tornozeleira Dourada", category: "Tornozeleiras", price: 49.9, stock: 3, active: true, image: "https://placehold.co/100x100" },
  { id: "6", name: "Anel Coração", category: "Anéis", price: 69.9, stock: 0, active: false, image: "https://placehold.co/100x100" },
];

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState(mockProducts);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Produtos</h1>
          <p className="text-gray-500">Gerencie o catálogo de produtos</p>
        </div>
        <button className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors">
          <FiPlus /> Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">R$ {product.price.toFixed(2).replace(".", ",")}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${product.stock === 0 ? "text-red-600" : product.stock < 5 ? "text-yellow-600" : "text-gray-800"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {product.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-rose-600" title="Visualizar">
                        <FiEye size={18} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-rose-600" title="Editar">
                        <FiEdit2 size={18} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600" title="Excluir">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
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