"use client";

import { useState, useEffect } from "react";

interface MercadoPagoCardFormProps {
  userEmail: string;
  onSubmit: (cardToken: string, installment: number) => void;
  onError: (error: string) => void;
  total: number;
}

export default function MercadoPagoCardForm({ userEmail, onSubmit, onError, total }: MercadoPagoCardFormProps) {
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [CardPaymentComponent, setCardPaymentComponent] = useState<any>(null);

  useEffect(() => {
    async function loadSDK() {
      try {
        const mp = await import("@mercadopago/sdk-react");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const init = (mp as any).default;
        if (typeof init === "function") {
          init(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "");
        }
        
        if (mp.CardPayment) {
          setCardPaymentComponent(() => mp.CardPayment);
          setIsReady(true);
        }
      } catch (err) {
        console.error("Error loading Mercado Pago SDK:", err);
        onError("Erro ao carregar sistema de pagamento");
      }
    }
    loadSDK();
  }, [onError]);

  const handleFormSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const token = formData.token;
      if (token) {
        onSubmit(token, 1);
      }
    } catch (err: any) {
      console.error("Card form error:", err);
      onError(err.message || "Erro ao processar cartão");
    } finally {
      setLoading(false);
    }
  };

  if (!isReady || !CardPaymentComponent) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="inline-block w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-sm text-text-muted">Carregando form de cartão...</p>
      </div>
    );
  }

  const customization = {
    visual: {
      style: {
        theme: "default",
        backgroundColor: "#ffffff",
        formBackgroundColor: "#ffffff",
        inputBackgroundColor: "#ffffff",
        labelColor: "#666666",
        textColor: "#333333",
        errorColor: "#e83f4f",
        fontSizeBase: "14px",
      },
    },
    paymentMethods: {
      maxInstallments: 1,
      minInstallments: 1,
    },
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <CardPaymentComponent
          initialization={{ email: userEmail, amount: total }}
          onSubmit={handleFormSubmit}
          customization={customization}
        />
      </div>
      {loading && (
        <div className="text-center py-2">
          <div className="inline-block w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-text-muted">Processando...</span>
        </div>
      )}
    </div>
  );
}