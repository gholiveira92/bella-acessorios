import Link from "next/link";
import { FiRefreshCw, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-serif text-rose-800 mb-8">Trocas e Devoluções</h1>
        
        <div className="space-y-8">
          <section className="flex gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiRefreshCw className="text-rose-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Política de Troca</h2>
              <p className="text-gray-600">
                Você tem até 7 dias após o recebimento para solicitar a troca do produto.
                O produto deve estar em sua embalagem original, sem uso e com todas as etiquetas.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiAlertCircle className="text-rose-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Como Solicitar</h2>
              <ol className="text-gray-600 space-y-2 list-decimal pl-4">
                <li>Entre em contato pelo WhatsApp ou e-mail</li>
                <li>Informe o número do pedido e motivo da troca</li>
                <li>Enviaremos as instruções para devolução</li>
                <li>Após recebermos o produto, efetuaremos a troca</li>
              </ol>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="text-rose-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Reembolso</h2>
              <p className="text-gray-600">
                Em caso de devolução, o reembolso será realizado pelo mesmo método de pagamento
                em até 10 dias úteis após recebimento do produto devolvido.
              </p>
            </div>
          </section>

          <section className="bg-rose-50 p-6 rounded-lg mt-8">
            <h2 className="text-xl font-semibold text-rose-800 mb-4">Importante</h2>
            <ul className="text-gray-700 space-y-2">
              <li>• Produtos personalizados não podem ser trocados</li>
              <li>• Custos de frete para troca são responsabilidade do cliente</li>
              <li>• Defeitos devem ser сообщены em até 30 dias</li>
            </ul>
          </section>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              <strong>Fale conosco:</strong> belaacessoriossa@gmail.com
            </p>
          </div>
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