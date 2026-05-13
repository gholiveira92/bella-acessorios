"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSave, FiImage } from "react-icons/fi";
import AdminLayout from "@/components/layout/AdminLayout";
import ImageUpload from "@/components/ui/ImageUpload";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    promotionalPrice: "",
    stock: "0",
    categoryId: "",
    weight: "",
    height: "",
    width: "",
    length: "",
    active: true,
    images: [] as string[],
    variations: [] as { id?: string; name: string; value: string; stock: number; price: string }[],
  });

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
      if (res.ok && data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/products");
      } else {
        alert(data.error || "Erro ao criar produto");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Erro ao criar produto");
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/products"
            className="p-2 text-text-muted hover:text-brand-gold"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-serif text-text-primary">Novo Produto</h1>
            <p className="text-text-muted">Adicione um novo produto ao catálogo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl p-6 border border-brand-bg-dark">
            <h2 className="text-lg font-medium text-text-primary mb-4">Imagens do Produto</h2>
            <ImageUpload
              images={formData.images}
              onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
              maxImages={5}
            />
          </div>

          <div className="bg-white rounded-xl p-6 border border-brand-bg-dark">
            <h2 className="text-lg font-medium text-text-primary mb-4">Informações Básicas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="Ex: Anel Casulo Dourado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="Descrição do produto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Categoria
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-brand-bg-dark">
            <h2 className="text-lg font-medium text-text-primary mb-4">Preços</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Preço *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">R$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Preço Promocional
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">R$</span>
                  <input
                    type="number"
                    name="promotionalPrice"
                    value={formData.promotionalPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-brand-bg-dark">
            <h2 className="text-lg font-medium text-text-primary mb-4">Estoque e Dimensões</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Estoque *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-4 h-4 text-brand-gold rounded"
                />
                <label htmlFor="active" className="text-sm text-text-secondary">
                  Produto ativo (visível na loja)
                </label>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Peso (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Altura (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full px-4 py-2 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Largura (cm)</label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full px-4 py-2 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Comprimento (cm)</label>
                <input
                  type="number"
                  name="length"
                  value={formData.length}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full px-4 py-2 border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-brand-bg-dark">
            <h2 className="text-lg font-medium text-text-primary mb-4">Variações do Produto</h2>
            <p className="text-sm text-text-muted mb-4">
              Adicione variações como Cor, Tamanho, Banho, etc.
            </p>
            
            <div className="space-y-4">
              {formData.variations.map((variation, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-brand-bg-light rounded-lg">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={variation.name}
                      onChange={(e) => {
                        const newVariations = [...formData.variations];
                        newVariations[index].name = e.target.value;
                        setFormData((prev) => ({ ...prev, variations: newVariations }));
                      }}
                      className="px-3 py-2 border border-brand-bg-dark rounded-lg text-sm"
                      placeholder="Tipo (ex: Cor)"
                    />
                    <input
                      type="text"
                      value={variation.value}
                      onChange={(e) => {
                        const newVariations = [...formData.variations];
                        newVariations[index].value = e.target.value;
                        setFormData((prev) => ({ ...prev, variations: newVariations }));
                      }}
                      className="px-3 py-2 border border-brand-bg-dark rounded-lg text-sm"
                      placeholder="Valor (ex: Dourado)"
                    />
                    <input
                      type="number"
                      value={variation.stock}
                      onChange={(e) => {
                        const newVariations = [...formData.variations];
                        newVariations[index].stock = parseInt(e.target.value) || 0;
                        setFormData((prev) => ({ ...prev, variations: newVariations }));
                      }}
                      className="px-3 py-2 border border-brand-bg-dark rounded-lg text-sm"
                      placeholder="Estoque"
                    />
                    <input
                      type="number"
                      value={variation.price}
                      onChange={(e) => {
                        const newVariations = [...formData.variations];
                        newVariations[index].price = e.target.value;
                        setFormData((prev) => ({ ...prev, variations: newVariations }));
                      }}
                      className="px-3 py-2 border border-brand-bg-dark rounded-lg text-sm"
                      placeholder="Preço adicional"
                      step="0.01"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newVariations = formData.variations.filter((_, i) => i !== index);
                      setFormData((prev) => ({ ...prev, variations: newVariations }));
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  variations: [...prev.variations, { name: "", value: "", stock: 0, price: "" }],
                }));
              }}
              className="mt-4 px-4 py-2 border border-dashed border-brand-bg-dark rounded-lg text-sm text-text-muted hover:border-brand-gold hover:text-brand-gold transition-colors"
            >
              + Adicionar Variação
            </button>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/admin/products"
              className="px-6 py-3 border border-brand-bg-dark rounded-lg text-text-secondary hover:bg-brand-bg-light transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiSave size={18} />
              )}
              {loading ? "Salvando..." : "Salvar Produto"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}