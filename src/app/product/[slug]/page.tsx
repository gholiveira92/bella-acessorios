"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { FiShoppingBag, FiCheck, FiCheckCircle, FiChevronRight } from "react-icons/fi";
import ProductGallery from "@/components/ui/ProductGallery";
import ShippingCalculator from "@/components/ui/ShippingCalculator";
import ProductBadges from "@/components/ui/ProductBadges";
import ProductCard from "@/components/ui/ProductCard";
import ProductJsonLd from "@/components/ui/ProductJsonLd";

interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  promotionalPrice: number | null;
  image: string;
  images?: string[];
}

interface ProductVariation {
  id: string;
  name: string;
  value: string;
  stock: number;
  price: number | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  details?: string;
  price: number;
  promotionalPrice: number | null;
  stock: number;
  images: ProductImage[];
  category: { name: string; slug: string };
  relatedProducts: RelatedProduct[];
  variations: ProductVariation[];
  variationTypes: string[];
}

function ProductContent() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});

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

const handleAddToCart = () => {
    if (!product) return;
    
    const mainImage = product.images.find((img) => img.isMain)?.url || product.images[0]?.url || "";
    
    let finalPrice = product.promotionalPrice || product.price;
    
    if (product.variations.length > 0 && Object.keys(selectedVariations).length > 0) {
      const selectedVariation = product.variations.find(v => 
        selectedVariations[v.name] === v.value && v.price
      );
      if (selectedVariation?.price) {
        finalPrice += selectedVariation.price;
      }
    }
    
    addItem({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      promotionalPrice: undefined,
      quantity,
      image: mainImage,
      variation: Object.keys(selectedVariations).length > 0 ? selectedVariations : undefined,
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const getTotalStock = () => {
    if (!product) return 0;
    if (product.variations.length === 0) return product.stock;
    
    const selectedValues = Object.values(selectedVariations);
    if (selectedValues.length === 0) {
      return product.variations.reduce((sum, v) => sum + v.stock, 0);
    }
    
    const variation = product.variations.find(v => 
      selectedValues.includes(v.value)
    );
    return variation?.stock || 0;
  };

  const variationTypes = product?.variationTypes || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-text-primary mb-4">Produto não encontrado</h1>
          <Link href="/catalog" className="text-brand-gold hover:underline">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = product.images.find((img) => img.isMain)?.url || product.images[0]?.url || "";
  const currentPrice = product.promotionalPrice || product.price;

  return (
    <div className="min-h-screen bg-brand-bg">
      {mainImage && (
        <ProductJsonLd
          name={product.name}
          description={product.description || ""}
          image={mainImage}
          price={currentPrice}
          url={`${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-text-muted mb-8">
          <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link>
          <FiChevronRight size={12} />
          <Link href="/catalog" className="hover:text-brand-gold transition-colors">Catálogo</Link>
          <FiChevronRight size={12} />
          <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-brand-gold transition-colors">
            {product.category.name}
          </Link>
          <FiChevronRight size={12} />
          <span className="text-text-primary truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16">
          {/* Left - Gallery */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right - Product Info */}
          <div className="space-y-6">
            {/* Name & Price */}
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-text-primary mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-3 mb-2">
                {product.promotionalPrice ? (
                  <>
                    <span className="text-2xl md:text-3xl font-semibold text-brand-gold-dark">
                      R$ {product.promotionalPrice.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-lg text-text-muted line-through">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="bg-brand-gold text-white text-xs font-medium px-2 py-1 rounded-full">
                      {Math.round((1 - product.promotionalPrice / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-2xl md:text-3xl font-semibold text-brand-gold-dark">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-text-muted">
                ou 3x sem juros de R$ {(currentPrice / 3).toFixed(2).replace(".", ",")}
              </p>
            </div>

            {/* Emotional Description */}
            <p className="text-text-secondary leading-relaxed">
              Elegância e delicadeza para compor qualquer ocasião. Uma peça que reflete sua essência e estilo único.
            </p>

            {/* Variations Selector */}
            {variationTypes.length > 0 && (
              <div className="space-y-4">
                {variationTypes.map((type) => (
                  <div key={type}>
                    <p className="text-sm text-text-muted mb-2">{type}:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variations
                        .filter((v) => v.name === type)
                        .map((variation) => (
                          <button
                            key={variation.id}
                            onClick={() => {
                              if (variation.stock > 0) {
                                setSelectedVariations((prev) => ({
                                  ...prev,
                                  [type]: variation.value,
                                }));
                              }
                            }}
                            disabled={variation.stock === 0}
                            className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                              selectedVariations[type] === variation.value
                                ? "border-brand-gold bg-brand-gold text-white"
                                : variation.stock === 0
                                ? "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                                : "border-brand-bg-dark hover:border-brand-gold"
                            }`}
                          >
                            {variation.value}
                            {variation.price ? ` (+R$ ${variation.price.toFixed(2)})` : ""}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-text-muted mb-2">Quantidade:</p>
                <div className="flex items-center border border-brand-bg-dark rounded-lg bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-text-secondary hover:text-brand-gold transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-6 py-3 font-sans text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(getTotalStock(), quantity + 1))}
                    className="px-4 py-3 text-text-secondary hover:text-brand-gold transition-colors"
                    disabled={quantity >= getTotalStock()}
                  >
                    +
                  </button>
                </div>
              </div>
              <span className="text-sm text-text-muted">{getTotalStock()} disponíveis</span>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-full flex items-center justify-center gap-3 font-sans text-base font-medium transition-all ${
                addedToCart 
                  ? "bg-green-600 text-white" 
                  : "bg-brand-gold text-white hover:bg-brand-gold-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {addedToCart ? (
                <>
                  <FiCheckCircle size={20} />
                  Adicionado ao Carrinho!
                </>
              ) : (
                <>
                  <FiShoppingBag size={20} />
                  Adicionar ao Carrinho
                </>
              )}
            </button>

            {/* Shipping Calculator */}
            <ShippingCalculator />

            {/* Badges */}
            <ProductBadges />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex border-b border-brand-bg-dark mb-6">
            {["description", "details", "care", "delivery"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-sans text-sm font-medium transition-colors relative ${
                  activeTab === tab 
                    ? "text-brand-gold" 
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tab === "description" && "Descrição"}
                {tab === "details" && "Detalhes"}
                {tab === "care" && "Cuidados"}
                {tab === "delivery" && "Entrega"}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 md:p-8">
            {activeTab === "description" && (
              <p className="text-text-secondary leading-relaxed">
                {product.description || "Este produto foi desenvolvido com materiais de alta qualidade, pensando em mulheres sofisticadas que valorizam elegância e bom gosto. Cada peça é uma declaração de estilo."}
              </p>
            )}
            {activeTab === "details" && (
              <p className="text-text-secondary leading-relaxed">
                {product.details || "• Material: Liga de cobre com banho de ouro 18k\n• Acabamento: Verniz premium\n• Tamanho: Ajustável\n• Peso: Leve e confortável"}
              </p>
            )}
            {activeTab === "care" && (
              <p className="text-text-secondary leading-relaxed">
                "• Evite contato com água, perfumes e cosméticos\n• Guarde em local seco e protegido\n• Limpe com pano macio e seco\n• Não exponha ao sol direto"
              </p>
            )}
            {activeTab === "delivery" && (
              <p className="text-text-secondary leading-relaxed">
                "• Frete grátis para Santo Anastácio/SP\n• Prazo: 3-7 dias úteis após confirmação\n• Embalagem premium e discreta\n• Rastreamento disponível"
              </p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif text-text-primary mb-8 text-center">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {product.relatedProducts.slice(0, 4).map((relProduct) => (
                <ProductCard 
                  key={relProduct.id} 
                  product={{
                    ...relProduct,
                    promotionalPrice: relProduct.promotionalPrice || null,
                    images: undefined,
                  }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProductContent />
    </Suspense>
  );
}