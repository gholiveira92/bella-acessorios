import Link from "next/link";
import { FiArrowRight, FiInstagram } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io5";

const categories = [
  { name: "Anéis", slug: "aneis", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop" },
  { name: "Brincos", slug: "brincos", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop" },
  { name: "Colares", slug: "colares", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop" },
  { name: "Pulseiras", slug: "pulseiras", image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=300&h=300&fit=crop" },
  { name: "Tornozeleiras", slug: "tornozeleiras", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop" },
  { name: "Ver Todos", slug: "catalog", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop" },
];

const featuredProducts = [
  {
    id: 1,
    name: "Anel Casulo Dourado",
    price: 89.9,
    promotionalPrice: 69.9,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
    slug: "anel-casulo-dourado",
  },
  {
    id: 2,
    name: "Brinco Ponto de Luz",
    price: 59.9,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
    slug: "brinco-ponto-de-luz",
  },
  {
    id: 3,
    name: "Colar Gargantilha",
    price: 129.9,
    promotionalPrice: 99.9,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
    slug: "colar-gargantilha",
  },
  {
    id: 4,
    name: "Pulseira Berloque",
    price: 79.9,
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=400&fit=crop",
    slug: "pulseira-berloque",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-rose-100 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-6xl font-serif text-rose-800 mb-4">
              Elegância em cada detalhe
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Descubra nossa coleção exclusiva de acessórios femininos.
              Qualidade, estilo e sofisticação para você.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-full hover:bg-rose-700 transition-colors"
            >
              Ver Catálogo <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-center text-rose-800 mb-12">
            Nossas Categorias
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={category.slug === "catalog" ? "/catalog" : `/catalog?category=${category.slug}`}
                className="group"
              >
                <div className="aspect-square rounded-full overflow-hidden mb-3">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <p className="text-center font-medium text-gray-700 group-hover:text-rose-600 transition-colors">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-rose-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-center text-rose-800 mb-12">
            Produtos em Destaque
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          <div className="text-center mt-12">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 border-2 border-rose-600 text-rose-600 px-6 py-3 rounded-full hover:bg-rose-600 hover:text-white transition-colors"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif text-rose-800 mb-4">Siga-nos no Instagram</h2>
          <p className="text-gray-600 mb-8">
            @bella.acessorios.sa
          </p>
          <a
            href="https://instagram.com/bella.acessorios.sa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            <FiInstagram /> Seguir no Instagram
          </a>
        </div>
      </section>

      <section className="py-16 bg-rose-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif text-rose-800 mb-4">Fale Conosco</h2>
          <p className="text-gray-600 mb-8">
            Tire suas dúvidas ou faça seu pedido pelo WhatsApp
          </p>
          <a
            href="https://wa.me/55SEUNUMERO"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
          >
            <IoLogoWhatsapp /> Chamar no WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}