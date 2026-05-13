"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiPackage } from "react-icons/fi";
import AdminLayout from "@/components/layout/AdminLayout";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  promotionalPrice: number | null;
  stock: number;
  active: boolean;
  category: { name: string; slug: string } | null;
  images: { id: string; url: string; isMain: boolean }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchProducts();
    }
  }, [status, session, search]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    try {
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, active: !currentActive }),
      });

      fetchProducts();
    } catch (error) {
      console.error("Error toggling product:", error);
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

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif text-text-primary">Produtos</h1>
          <p className="text-text-muted">Gerencie o catálogo de produtos</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-brand-gold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <FiPlus /> Novo Produto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brand-bg-dark">
        <div className="p-4 border-b border-brand-bg-dark">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-bg-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Imagem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg-dark">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-bg-light">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiPackage className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-text-primary">{product.name}</p>
                      <p className="text-xs text-text-muted">/{product.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {product.category?.name || "Sem categoria"}
                    </td>
                    <td className="px-6 py-4">
                      {product.promotionalPrice ? (
                        <div>
                          <p className="text-sm font-semibold text-brand-gold">
                            R$ {product.promotionalPrice.toFixed(2).replace(".", ",")}
                          </p>
                          <p className="text-xs text-text-muted line-through">
                            R$ {product.price.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-text-primary">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${product.stock <= 5 ? "text-red-500" : "text-text-primary"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(product.id, product.active)}
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          product.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1 text-text-muted hover:text-brand-gold"
                          title="Editar"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1 text-text-muted hover:text-red-500"
                          title="Excluir"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
                    Nenhum produto encontrado
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