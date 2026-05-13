import Link from "next/link";
import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io5";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-brand-gold-dark mb-4">Fale Conosco</h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Estamos aqui para ajudar. Entre em contato pelo canal de sua preferência.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* WhatsApp */}
          <div className="bg-green-50 p-8 rounded-2xl">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <IoLogoWhatsapp size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">WhatsApp</h2>
            <p className="text-gray-600 mb-4">Resposta mais rápida. Clique para iniciar uma conversa.</p>
            <a
              href="https://wa.me/5518997421253?text=Olá! Gostaria de saber mais sobre os produtos."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-600 font-medium hover:underline"
            >
              <IoLogoWhatsapp size={18} />
              (18) 99742-1253
            </a>
          </div>

          {/* E-mail */}
          <div className="bg-blue-50 p-8 rounded-2xl">
            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <FiMail size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">E-mail</h2>
            <p className="text-gray-600 mb-4">Para dúvidas detalhadas ou necessidades específicas.</p>
            <a
              href="mailto:belaacessoriossa@gmail.com?subject=Contato via site"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
            >
              <FiMail size={18} />
              belaacessoriossa@gmail.com
            </a>
          </div>

          {/* Instagram */}
          <div className="bg-pink-50 p-8 rounded-2xl">
            <div className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Instagram</h2>
            <p className="text-gray-600 mb-4">Siga nosso perfil para inspiração diária.</p>
            <a
              href="https://instagram.com/bella.acessorios.sa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-pink-600 font-medium hover:underline"
            >
              @bella.acessorios.sa
            </a>
          </div>

          {/* Location */}
          <div className="bg-amber-50 p-8 rounded-2xl">
            <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mb-4">
              <FiMapPin size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Localização</h2>
            <p className="text-gray-600 mb-4">Santo Anastácio, São Paulo</p>
            <p className="text-gray-500 text-sm">CEP: 19360-000</p>
          </div>
        </div>

        <div className="bg-brand-bg-light p-8 rounded-2xl mb-16">
          <div className="flex items-center gap-3 mb-4">
            <FiClock className="text-brand-gold" size={20} />
            <h3 className="font-semibold text-gray-800">Horário de Atendimento</h3>
          </div>
          <ul className="text-gray-600 space-y-2">
            <li className="flex justify-between">
              <span>Segunda a Sexta</span>
              <span className="font-medium">09:00 - 18:00</span>
            </li>
            <li className="flex justify-between">
              <span>Sábado</span>
              <span className="font-medium">09:00 - 14:00</span>
            </li>
            <li className="flex justify-between text-text-muted">
              <span>Domingo</span>
              <span>Fechado</span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-text-secondary mb-6">Ou navegue pelo nosso site:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/catalog" className="px-6 py-3 bg-brand-gold text-white rounded-full hover:bg-brand-gold-dark transition-colors">
              Ver Produtos
            </Link>
            <Link href="/shipping" className="px-6 py-3 border border-brand-gold-dark text-brand-gold-dark rounded-full hover:bg-brand-bg-light transition-colors">
              Frete e Entrega
            </Link>
            <Link href="/returns" className="px-6 py-3 border border-brand-gold-dark text-brand-gold-dark rounded-full hover:bg-brand-bg-light transition-colors">
              Trocas e Devoluções
            </Link>
          </div>
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