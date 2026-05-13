import Link from "next/link";
import { FiArrowRight, FiInstagram } from "react-icons/fi";
import { AnimatedSection, AnimatedCard } from "@/components/ui/AnimatedSection";
import Hero from "@/components/ui/Hero";

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
      <Hero />

      {/* Categories */}
      <section className="py-16 md:py-24 bg-brand-bg-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <AnimatedSection delay={0.2}>
            <h2 className="text-3xl md:text-4xl font-serif text-center text-brand-gold-dark mb-3">
              Nossas Categorias
            </h2>
            <p className="text-center text-text-muted mb-12 max-w-xl mx-auto">
              Encontre o acessório perfeito para cada ocasião
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <AnimatedCard key={category.slug} delay={0.08 * index}>
                <Link
                  href={category.slug === "catalog" ? "/catalog" : `/catalog?category=${category.slug}`}
                  className="group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-center font-medium text-text-secondary text-sm md:text-base mt-2">
                    {category.name}
                  </p>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <AnimatedSection delay={0.2}>
            <div className="text-center mb-12">
              <span className="text-brand-gold font-medium text-sm uppercase tracking-widest">Destaques</span>
              <h2 className="text-3xl md:text-4xl font-serif text-brand-gold-dark mt-2">
                Produtos em Destaque
              </h2>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product, index) => (
              <AnimatedCard key={product.id} delay={0.08 * index}>
                <Link href={`/product/${product.slug}`} className="group block">
                  <div className="bg-brand-bg-light rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 -translate-y-1 group-hover:-translate-y-2">
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      {product.promotionalPrice && (
                        <span className="absolute top-3 left-3 bg-brand-gold text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                          {Math.round((1 - product.promotionalPrice / product.price) * 100)}% OFF
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-gold-dark/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-medium text-text-primary mb-1.5 group-hover:text-brand-gold transition-colors text-sm md:text-base line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.promotionalPrice ? (
                          <>
                            <span className="text-brand-gold-dark font-bold text-base md:text-lg">
                              R$ {product.promotionalPrice.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-text-muted line-through text-xs md:text-sm">
                              R$ {product.price.toFixed(2).replace(".", ",")}
                            </span>
                          </>
                        ) : (
                          <span className="text-brand-gold-dark font-bold text-base md:text-lg">
                            R$ {product.price.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">ou 3x sem juros</span>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            ))}
          </div>
          
          <div className="text-center mt-10 md:mt-12">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 border-2 border-brand-gold-dark text-brand-gold-dark px-6 py-3 rounded-full hover:bg-brand-gold-dark hover:text-white transition-all duration-300 text-sm md:text-base"
            >
              Ver Todos os Produtos <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Lifestyle Section 01 */}
      <section className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=1920&h=1080&fit=crop&q=80"
          alt="Mulher elegante com acessórios"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-gold-dark/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-2xl px-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-4 leading-tight">
              Elegância nos pequenos detalhes
            </h2>
            <p className="text-white/90 text-base md:text-lg mb-8">
              Acessórios que complementam sua essência e elevam seu estilo.
            </p>
            <Link
              href="/catalog?category=aneis"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-brand-gold-dark rounded-full font-sans text-sm font-medium hover:bg-brand-bg-light transition-all duration-300"
            >
              Ver Coleção
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Section */}
      <section className="py-16 md:py-24 bg-brand-bg-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop&q=80"
                alt="Acessórios premium"
                className="w-full h-[400px] md:h-[500px] object-cover rounded-xl"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <span className="text-brand-gold text-sm uppercase tracking-widest font-medium">Editorial</span>
              <h2 className="text-3xl md:text-4xl font-serif text-brand-gold-dark mt-4 mb-6">
                A elegância mora nos detalhes
              </h2>
              <p className="text-text-secondary text-base leading-relaxed mb-8">
                Cada peça é desenhada para mulheres que valorizam sofisticação e bom gosto. 
                Nossos acessórios são mais que украшения — são expressões de personalidade.
              </p>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 border-2 border-brand-gold-dark text-brand-gold-dark px-8 py-3 rounded-full hover:bg-brand-gold-dark hover:text-white transition-all duration-300 font-medium"
              >
                Explorar Loja
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
<div className="text-center p-6 md:p-8 rounded-2xl bg-brand-bg-light hover:bg-brand-bg transition-colors">
              <div className="w-14 h-14 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2 text-lg">Qualidade Premium</h3>
              <p className="text-text-muted text-sm leading-relaxed">Produtos banhados a ouro 18k com acabamento perfeito</p>
            </div>
            <div className="text-center p-6 md:p-8 rounded-2xl bg-brand-bg-light hover:bg-brand-bg transition-colors">
              <div className="w-14 h-14 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2 text-lg">Frete Grátis</h3>
              <p className="text-text-muted text-sm leading-relaxed">Frete grátis para compras acima de R$ 299</p>
            </div>
            <div className="text-center p-6 md:p-8 rounded-2xl bg-brand-bg-light hover:bg-brand-bg transition-colors">
              <div className="w-14 h-14 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2 text-lg">Atendimento Personalizado</h3>
              <p className="text-text-muted text-sm leading-relaxed">Nossa equipe está pronta para tirar suas dúvidas</p>
            </div>
          </div>
        </div>
      </section>

{/* Instagram Section */}
      <section className="py-16 md:py-20 bg-brand-bg-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="text-brand-gold text-sm uppercase tracking-widest font-medium">@bella.acessorios.sa</span>
            <h2 className="text-3xl md:text-4xl font-serif text-brand-gold-dark mt-3">Siga-nos no Instagram</h2>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4 mb-10">
            {[
              "https://images.unsplash.com/photo-1617038224538-2a5d96930c30?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop",
            ].map((img, idx) => (
              <div key={idx} className="aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                <img src={img} alt={`Instagram ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <a
              href="https://instagram.com/bella.acessorios.sa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border-2 border-brand-gold-dark text-brand-gold-dark px-8 py-3 rounded-full hover:bg-brand-gold-dark hover:text-white transition-all duration-300 font-medium"
            >
              <FiInstagram /> Seguir no Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}