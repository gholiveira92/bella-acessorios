"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import { FiPlus, FiEdit2, FiTrash2, FiImage } from "react-icons/fi";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  active: boolean;
}

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", image: "", active: true });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchCategories();
    }
  }, [status, session]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const method = editingCategory ? "PUT" : "POST";
    const body = editingCategory 
      ? { id: editingCategory.id, ...formData }
      : formData;

    try {
      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ name: "", image: "", active: true });
        fetchCategories();
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, image: category.image || "", active: category.active });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  if (status === "loading" || !session) {
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-text-primary">Categorias</h1>
          <p className="text-text-muted">Gerencie as categorias de produtos</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            setFormData({ name: "", image: "", active: true });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg hover:opacity-90"
        >
          <FiPlus size={18} />
          Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 border border-brand-bg-dark mb-8">
          <h2 className="text-lg font-medium text-text-primary mb-4">
            {editingCategory ? "Editar Categoria" : "Nova Categoria"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Nome da Categoria *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="Ex: Anéis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                URL da Imagem (opcional)
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-3 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-brand-gold rounded"
              />
              <label htmlFor="active" className="text-sm text-text-secondary">
                Categoria ativa
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
                className="px-6 py-3 border border-brand-bg-dark rounded-lg text-text-secondary hover:bg-brand-bg-light"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-brand-gold text-white rounded-lg hover:opacity-90"
              >
                {editingCategory ? "Salvar Alterações" : "Criar Categoria"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-brand-bg-dark">
          <FiImage className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-text-muted">Nenhuma categoria cadastrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-bg-dark overflow-hidden">
          <table className="w-full">
            <thead className="bg-brand-bg-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg-dark">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-brand-bg-light">
                  <td className="px-6 py-4 font-medium text-text-primary">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-text-muted">{category.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {category.active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-brand-gold hover:bg-brand-bg-light rounded-lg"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}