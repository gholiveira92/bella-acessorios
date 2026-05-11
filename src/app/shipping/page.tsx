import Link from "next/link";
import { FiTruck, FiClock, FiPackage } from "react-icons/fi";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-serif text-rose-800 mb-8">Frete e Entrega</h1>
        
        <div className="space-y-8">
          <section className="flex gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiTruck className="text-rose-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Formas de Envio</h2>
              <p className="text-gray-600">
                Trabalhamos com os Correios (PAC e SEDEX) e transportadoras parceiras. 
                A escolha da transportadora é feita durante o checkout.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiClock className="text-rose-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Prazos de Entrega</h2>
              <ul className="text-gray-600 space-y-2">
                <li><strong>PAC:</strong> 5 a 12 úteis</li>
                <li><strong>SEDEX:</strong> 2 a 5 úteis</li>
              </ul>
              <p className="text-gray-500 text-sm mt-2">
                O prazo começa a contar após a confirmação do pagamento.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiPackage className="text-rose-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Frete Grátis</h2>
              <p className="text-gray-600">
                Frete grátis para pedidos acima de R$ 299,00 (valido para todo o Brasil).
              </p>
            </div>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Rastreamento</h2>
            <p className="text-gray-600">
              Assim que seu pedido for enviado, você receberá um e-mail com o código de rastreamento. 
              Você também pode acompanhar o status em "Meus Pedidos" no site.
            </p>
          </section>
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