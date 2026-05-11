import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-serif text-rose-800 mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais quando você usa nossa loja online.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. Informações que Coletamos</h2>
          <p className="text-gray-600 mb-4">
            Coletamos informações que você nos fornece diretamente, incluindo:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Telefone</li>
            <li>CPF</li>
            <li>Endereço de entrega</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. Como Usamos suas Informações</h2>
          <p className="text-gray-600 mb-4">
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Processar seus pedidos</li>
            <li>Comunicar sobre o status do pedido</li>
            <li>Fornecer suporte ao cliente</li>
            <li>Melhorar nossos serviços</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. Proteção de Dados</h2>
          <p className="text-gray-600 mb-4">
            Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração ou destruição.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. Seus Direitos</h2>
          <p className="text-gray-600 mb-4">
            Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Para exercer esses direitos, entre em contato conosco.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">5. Contato</h2>
          <p className="text-gray-600 mb-4">
            Se tiver dúvidas sobre esta Política de Privacidade, entre em contato pelo e-mail: <strong>belaacessoriossa@gmail.com</strong>
          </p>

          <p className="text-gray-500 text-sm mt-8">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-rose-600 hover:underline">
            ← Voltar para Home
          </Link>
        </div>
      </div>
    </div>
  );
}