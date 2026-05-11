import Link from "next/link";
import { FiArrowRight, FiInstagram } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io5";
import { AnimatedSection, AnimatedCard, FadeIn } from "@/components/ui/AnimatedSection";

const categories = [
  { name: "Anéis", slug: "aneis", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop" },
  { name: "Brincos", slug: "brincos", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop" },
  { name: "Colares", slug: "colares", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop" },
  { name: "Pulseiras", slug: "pulseiras", image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=400&fit=crop" },
  { name: "Tornozeleiras", slug: "tornozeleiras", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop" },
  { name: "Ver Todos", slug: "catalog", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop" },
];

const featuredProducts = [
  { id: 1, name: "Anel Casulo Dourado", price: 89.9, promotionalPrice: 69.9, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop", slug: "anel-casulo-dourado" },
  { id: 2, name: "Brinco Ponto de Luz", price: 59.9, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop", slug: "brinco-ponto-de-luz" },
  { id: 3, name: "Colar Gargantilha", price: 129.9, promotionalPrice: 99.9, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop", slug: "colar-gargantilha" },
  { id: 4, name: "Pulseira Berloque", price: 79.9, image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&h=500&fit=crop", slug: "pulseira-berloque" },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1617038224538-2a5d96930c30?w=1920&h=1080&fit=crop" 
            alt="Bella Acessórios" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-900/80 to-rose-600/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
          <AnimatedSection>
            <div className="max-w-2xl">
              <span className="inline-block bg-rose-500 text-white px-4 py-1 rounded-full text-sm mb-4">
                Nova Coleção 2024
              </span>
              <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
                Elegância em cada detalhe
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-lg">
                Descubra nossa coleção exclusiva de acessórios femininos. 
                Qualidade, estilo e sofisticação para você.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 bg-white text-rose-600 px-8 py-4 rounded-full hover:bg-rose-50 transition-colors font-medium"
                >
                  Ver Catálogo <FiArrowRight />
                </Link>
                <a
                  href="https://wa.me/55SEUNUMERO"
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-rose-500/20 text-white border border-white/30 px-8 py-4 rounded-full hover:bg-rose-500/40 transition-colors"
                >
                  <IoLogoWhatsapp /> Falar no WhatsApp
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/70 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection delay={0.2}>
            <h2 className="text-4xl font-serif text-center text-rose-800 mb-4">
              Nossas Categorias
            </h2>
            <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
              Encontre o acessório perfeito para cada ocasião
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <AnimatedCard key={category.slug} delay={0.1 * index}>
                <Link
                  href={category.slug === "catalog" ? "/catalog" : `/catalog?category=${category.slug}`}
                  className="group block"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-center font-medium text-gray-700 group-hover:text-rose-600 transition-colors text-lg">
                    {category.name}
                  </p>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection delay={0.2}>
            <div className="text-center mb-12">
              <span className="text-rose-600 font-medium">Destaques</span>
              <h2 className="text-4xl font-serif text-rose-800 mt-2">
                Produtos em Destaque
              </h2>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product, index) => (
              <AnimatedCard key={product.id} delay={0.1 * index}>
                <Link href={`/product/${product.slug}`} className="group block">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300">
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.promotionalPrice && (
                        <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {Math.round((1 - product.promotionalPrice / product.price) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 mb-2 group-hover:text-rose-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {product.promotionalPrice ? (
                          <>
                            <span className="text-rose-600 font-bold text-lg">
                              R$ {product.promotionalPrice.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-gray-400 line-through text-sm">
                              R$ {product.price.toFixed(2).replace(".", ",")}
                            </span>
                          </>
                        ) : (
                          <span className="text-rose-600 font-bold text-lg">
                            R$ {product.price.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 border-2 border-rose-600 text-rose-600 px-8 py-3 rounded-full hover:bg-rose-600 hover:text-white transition-all duration-300"
            >
              Ver Todos os Produtos <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Qualidade Premium</h3>
              <p className="text-gray-500">Produtos banhados a ouro 18k com acabamento perfeito</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Envio Rápido</h3>
              <p className="text-gray-500">Frete grátis para compras acima de R$ 299</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Atendimento Personalizado</h3>
              <p className="text-gray-500"> Nossa equipe está pronta para tirar suas dúvidas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif mb-4">Siga-nos no Instagram</h2>
          <p className="text-white/80 mb-8 text-lg">@bella.acessorios.sa</p>
          <a
            href="https://instagram.com/bella.acessorios.sa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-3 rounded-full hover:bg-white/90 transition-colors font-medium"
          >
            <FiInstagram /> Seguir no Instagram
          </a>
        </div>
      </section>
    </div>
  );
}