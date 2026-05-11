"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { FiShoppingBag, FiTruck, FiCheck, FiCheckCircle } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io5";

interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promotionalPrice: number | null;
  stock: number;
  images: ProductImage[];
  category: { name: string; slug: string };
  relatedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
  }>;
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState("");
  const [shipping, setShipping] = useState<{ option: string; price: number; deadline: number } | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleCalculateShipping = () => {
    if (cep.length !== 8) {
      alert("CEP inválido");
      return;
    }

    setShippingLoading(true);
    setTimeout(() => {
      setShipping({ option: "PAC", price: 15.9, deadline: 5 });
      setShippingLoading(false);
    }, 1000);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const mainImage = product.images.find((img) => img.isMain)?.url || product.images[0]?.url || "";
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      promotionalPrice: product.promotionalPrice || undefined,
      quantity,
      image: mainImage,
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-gray-800 mb-4">Produto não encontrado</h1>
          <Link href="/catalog" className="text-rose-600 hover:underline">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = product.images.find((img) => img.isMain)?.url || product.images[0]?.url || "";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-rose-600">Início</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-rose-600">Catálogo</Link>
          <span>/</span>
          <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-rose-600">{product.category.name}</Link>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? "border-rose-600" : "border-transparent"
                    }`}
                  >
                    <img src={img.url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-gray-800 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              {product.promotionalPrice ? (
                <>
                  <span className="text-2xl text-rose-600 font-semibold">
                    R$ {product.promotionalPrice.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-gray-400 line-through">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="bg-rose-100 text-rose-600 text-xs px-2 py-1 rounded">
                    {Math.round((1 - product.promotionalPrice / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="text-2xl text-rose-600 font-semibold">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Quantidade:</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-500 hover:text-rose-600"
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 text-gray-500 hover:text-rose-600"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">{product.stock} disponíveis</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full text-white py-3 rounded-full flex items-center justify-center gap-2 mb-4 transition-colors ${
                addedToCart ? "bg-green-600" : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {addedToCart ? (
                <>
                  <FiCheckCircle /> Adicionado ao Carrinho!
                </>
              ) : (
                <>
                  <FiShoppingBag /> Adicionar ao Carrinho
                </>
              )}
            </button>

            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Calcular Frete:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="CEP"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                  maxLength={8}
                />
                <button
                  onClick={handleCalculateShipping}
                  disabled={shippingLoading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  {shippingLoading ? "..." : "Calcular"}
                </button>
              </div>
              {shipping && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiTruck className="text-gray-500" />
                      <span className="text-sm">PAC</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">R$ {shipping.price.toFixed(2).replace(".", ",")}</p>
                      <p className="text-xs text-gray-500">{shipping.deadline} úteis</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif text-rose-800 mb-8">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {product.relatedProducts.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 mb-1">{p.name}</h3>
                      <p className="text-rose-600 font-semibold">R$ {p.price.toFixed(2).replace(".", ",")}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 bg-rose-50 p-8 rounded-lg text-center">
          <h3 className="text-xl font-serif text-rose-800 mb-2">Ficou com dúvidas?</h3>
          <p className="text-gray-600 mb-4">Estamos à disposição para ajudar você</p>
          <a
            href="https://wa.me/55SEUNUMERO"
            target="_blank"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
          >
            <IoLogoWhatsapp /> Chamar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}