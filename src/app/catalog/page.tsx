"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiSearch, FiFilter } from "react-icons/fi";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  promotionalPrice: number | null;
  image: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif text-rose-800 mb-8">Catálogo</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 mb-2 group-hover:text-rose-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {product.promotionalPrice ? (
                        <>
                          <span className="text-rose-600 font-semibold">
                            R$ {product.promotionalPrice.toFixed(2).replace(".", ",")}
                          </span>
                          <span className="text-gray-400 line-through text-sm">
                            R$ {product.price.toFixed(2).replace(".", ",")}
                          </span>
                        </>
                      ) : (
                        <span className="text-rose-600 font-semibold">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}