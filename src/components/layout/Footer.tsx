import Link from "next/link";
import { FiInstagram, FiMail } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-serif text-rose-600 mb-4">Bella Acessórios</h3>
            <p className="text-gray-600 text-sm">
              Acessórios femininos elegantes e modernos para complementar seu estilo.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-rose-600 transition-colors">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-rose-600 transition-colors">
                  Fale conosco
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-rose-600 transition-colors">
                  Política de privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Atendimento</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/faq" className="hover:text-rose-600 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-rose-600 transition-colors">
                  Frete e entrega
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-rose-600 transition-colors">
                  Trocas e devoluções
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Contato</h4>
            <div className="flex gap-4">
              <Link
                href="https://instagram.com/bella.acessorios.sa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-rose-600 transition-colors"
              >
                <FiInstagram size={20} />
              </Link>
              <Link
                href="https://wa.me/55SEUNUMERO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-rose-600 transition-colors"
              >
                <IoLogoWhatsapp size={20} />
              </Link>
              <Link
                href="mailto:belaacessoriossa@gmail.com"
                className="text-gray-600 hover:text-rose-600 transition-colors"
              >
                <FiMail size={20} />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Bella Acessórios. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}