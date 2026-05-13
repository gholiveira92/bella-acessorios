"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiSearch, FiChevronRight } from "react-icons/fi";
import ProductCard from "@/components/ui/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  promotionalPrice: number | null;
  image: string;
  category: string;
}

const categories = [
  { id: "all", name: "Todos", slug: "todos" },
  { id: "1", name: "Anéis", slug: "aneis" },
  { id: "2", name: "Brincos", slug: "brincos" },
  { id: "3", name: "Colares", slug: "colares" },
  { id: "4", name: "Pulseiras", slug: "pulseiras" },
  { id: "5", name: "Tornozeleiras", slug: "tornozeleiras" },
];

const sortOptions = [
  { value: "newest", label: "Novidades" },
  { value: "price-asc", label: "Menor Preço" },
  { value: "price-desc", label: "Maior Preço" },
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "todos";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const activeCategory = categories.find(c => c.slug === category);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== "todos") params.set("category", category);
        if (search) params.set("search", search);
        if (sort) params.set("sort", sort);

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();

        const formattedProducts = data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price),
          promotionalPrice: p.promotionalPrice ? Number(p.promotionalPrice) : null,
          image: p.images.find((i: any) => i.isMain)?.url || p.images[0]?.url || "",
          category: p.category?.name || "",
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [category, search, sort]);

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link>
          <FiChevronRight size={12} />
          <span className="text-brand-gold-dark font-medium">
            {activeCategory?.name || "Catálogo"}
          </span>
        </nav>

        {/* Category Navigation - Horizontal Bar */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.slug)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-sans transition-all duration-300 whitespace-nowrap ${
                  category === cat.slug
                    ? "bg-brand-gold text-white shadow-md"
                    : "bg-white text-text-secondary hover:bg-brand-bg-light hover:text-brand-gold border border-brand-bg-dark"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Sort Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-sans text-sm"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 bg-white border border-brand-bg-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-sans text-sm text-text-secondary"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Products Count */}
        <p className="text-sm text-text-muted mb-6">
          {loading ? "Carregando..." : `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
        </p>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-muted mt-4 text-sm">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-text-muted">Nenhum produto encontrado.</p>
            <button 
              onClick={() => {setCategory("todos"); setSearch("");}}
              className="mt-4 text-brand-gold hover:underline text-sm"
            >
              Ver todos os produtos
            </button>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* CSS for hidden scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}