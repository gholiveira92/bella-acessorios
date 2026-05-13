import Link from "next/link";
import { FiHeart, FiAward, FiSmile } from "react-icons/fi";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-brand-gold-dark mb-4">Sobre Nós</h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Elegância e sofisticação em cada detalhe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop&q=80"
              alt="Bella Acessórios"
              className="w-full h-[400px] md:h-[500px] object-cover rounded-xl"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-brand-gold text-sm uppercase tracking-widest font-medium mb-4">
              Nossa História
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-brand-gold-dark mb-6">
              Criamos acessórios que refletem sua essência
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              A Bella Acessórios nasceu do sonho de oferecer peças únicas para mulheres que valorizam
              elegância e bom gosto. Cada acessório é desenvolvido com atenção aos detalhes,
              garantindo qualidade e sofisticação.
            </p>
            <p className="text-text-secondary leading-relaxed mb-6">
              Trabalhamos com materiais de alta qualidade, como banho de ouro 18k, e oferecemos
              peças que combinam perfeitamente com qualquer look — do casual ao sofisticado.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Nossa missão é fazer você se sentir especial todos os dias, com acessórios que
              complementam seu estilo e elevam sua autoestima.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 bg-brand-bg-light rounded-2xl">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="text-brand-gold text-2xl" />
            </div>
            <h3 className="font-serif text-xl text-brand-gold-dark mb-3">Feito com Amor</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Cada peça é cuidadosamente preparada para trazer alegria e confiança.
            </p>
          </div>
          <div className="text-center p-8 bg-brand-bg-light rounded-2xl">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAward className="text-brand-gold text-2xl" />
            </div>
            <h3 className="font-serif text-xl text-brand-gold-dark mb-3">Qualidade Premium</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Materiais selecionados e banho de ouro 18k para durabilidade e brilho.
            </p>
          </div>
          <div className="text-center p-8 bg-brand-bg-light rounded-2xl">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSmile className="text-brand-gold text-2xl" />
            </div>
            <h3 className="font-serif text-xl text-brand-gold-dark mb-3">Clientes Felizes</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Sua satisfação é nossa prioridade. Estamos aqui para você.
            </p>
          </div>
        </div>

        <div className="bg-brand-gold-dark text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-serif mb-4">Venha fazer parte da nossa história</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Explore nossa coleção e encontre o acessório perfeito para você.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-brand-gold-dark rounded-full font-medium hover:bg-brand-bg-light transition-all"
          >
            Ver Coleção
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-brand-gold hover:underline">
            ← Voltar para Home
          </Link>
        </div>
      </div>
    </div>
  );
}