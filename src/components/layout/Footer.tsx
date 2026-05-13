import Link from "next/link";
import { FiInstagram, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="bg-brand-gold-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-serif text-white mb-4 tracking-wide">Bella Acessórios</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Acessórios femininos elegantes e modernos para complementar seu estilo com sofisticação.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://instagram.com/bella.acessorios.sa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <FiInstagram size={18} />
              </Link>
<Link
                  href="https://wa.me/5518997421253"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                <IoLogoWhatsapp size={18} />
              </Link>
              <Link
                href="mailto:belaacessoriossa@gmail.com"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <FiMail size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Institucional</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Fale conosco
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Política de privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Atendimento</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ - Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Frete e entrega
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Trocas e devoluções
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Contato</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <FiMapPin className="flex-shrink-0 mt-0.5" size={16} />
                <span>Santo Anastácio, SP</span>
              </li>
              <li>
                <Link
                  href="https://wa.me/5518997421253"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <IoLogoWhatsapp size={16} />
                  <span>(18) 99742-1253</span>
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:belaacessoriossa@gmail.com"
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <FiMail size={16} />
                  <span>belaacessoriossa@gmail.com</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 text-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Bella Acessórios. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}