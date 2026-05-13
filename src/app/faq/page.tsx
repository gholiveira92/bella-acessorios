"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";

const faqs = [
  {
    question: "Como funciona o pagamento?",
    answer: "Aceitamos PIX e cartão de crédito. Para PIX, o código é gerado automaticamente e a confirmação ocorre em poucos minutos. Para cartão, processamos via Mercado Pago com segurança total.",
  },
  {
    question: "Qual o prazo de entrega?",
    answer: "O prazo varia conforme a localização e opção de frete escolhida. Em geral: PAC (5 a 12 dias úteis) e SEDEX (2 a 5 dias úteis). O prazo começa a contar após confirmação do pagamento.",
  },
  {
    question: "Como funciona o frete grátis?",
    answer: "Oferecemos frete grátis para pedidos acima de R$ 299,00 para todo o Brasil. Para clientes de Santo Anastácio/SP, também oferecemos entrega local gratuita.",
  },
  {
    question: "Posso trocar ou devolver um produto?",
    answer: "Sim, você tem até 7 dias após o recebimento para solicitar a troca ou devolução. O produto deve estar em sua embalagem original, sem uso e com todas as etiquetas.",
  },
  {
    question: "Como solicito uma troca?",
    answer: "Entre em contato pelo WhatsApp (18) 99742-1253 ou e-mail belaacessoriossa@gmail.com informando o número do pedido e o motivo da troca. Enviaremos as instruções para devolução.",
  },
  {
    question: "Em quanto tempo recebo o reembolso?",
    answer: "O reembolso é realizado pelo mesmo método de pagamento em até 10 dias úteis após recebimento do produto devolvido.",
  },
  {
    question: "Os produtos são banhados a ouro?",
    answer: "Sim, trabalhamos com produtos de alta qualidade banhados a ouro 18k, com verniz premium para maior durabilidade e brilho.",
  },
  {
    question: "Como cuidar dos meus acessórios?",
    answer: "Para manter seus acessórios sempre bonitos: evite contato com água, perfumes e cosméticos; guarde em local seco e protegido; limpe com pano macio e seco; não exponha ao sol direto.",
  },
  {
    question: "Posso acompanhar meu pedido?",
    answer: "Sim! Assim que seu pedido for enviado, você recebe o código de rastreamento por e-mail. Pode acompanhar o status também na página 'Meus Pedidos' do seu حساب.",
  },
  {
    question: "Como funciona o cadastro?",
    answer: "No checkout, você preencherá seus dados (nome, e-mail, CPF, telefone) e endereço de entrega. Todos os campos são validados para garantir segurança e correção nas informações.",
  },
  {
    question: "Vocês têm loja física?",
    answer: "No momento, operamos 100% online, o que nos permite oferecer produtos de alta qualidade a preços mais acessíveis. Você pode conhecer nossos produtos pelo site e WhatsApp.",
  },
  {
    question: "Como entrar em contato com o suporte?",
    answer: "Você pode nos contatar pelo WhatsApp (18) 99742-1253, por e-mail belaacessoriossa@gmail.com ou pelo Instagram @bella.acessorios.sa. Respondemos em até 24 horas.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-brand-gold-dark mb-4">Perguntas Frequentes</h1>
          <p className="text-text-secondary text-lg">
            Encontre respostas para as dúvidas mais comuns
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-brand-bg-dark rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-brand-bg-light transition-colors"
              >
                <span className="font-medium text-gray-800 pr-4">{faq.question}</span>
                <FiChevronDown
                  size={20}
                  className={`text-brand-gold flex-shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-48" : "max-h-0"}`}
              >
                <p className="px-5 pb-5 text-text-muted leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-brand-bg-light p-8 rounded-2xl text-center">
          <h2 className="text-xl font-serif text-brand-gold-dark mb-4">Não encontrou sua resposta?</h2>
          <p className="text-text-muted mb-6">
            Estamos aqui para ajudar. Entre em contato pelo canal de sua preferência.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/5518997421253"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              WhatsApp
            </a>
            <a
              href="mailto:belaacessoriossa@gmail.com"
              className="px-6 py-3 bg-brand-gold text-white rounded-full hover:bg-brand-gold-dark transition-colors"
            >
              E-mail
            </a>
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