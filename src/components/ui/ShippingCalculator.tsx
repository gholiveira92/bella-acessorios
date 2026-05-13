"use client";

import { useState } from "react";
import { FiTruck, FiCheck, FiPackage, FiAlertCircle } from "react-icons/fi";

interface ShippingQuote {
  id: string;
  name: string;
  price: number;
  deliveryTime: number;
  company: string;
}

interface ShippingCalculatorProps {
  onCalculate?: (cep: string) => Promise<ShippingQuote[]>;
}

export default function ShippingCalculator({ onCalculate }: ShippingCalculatorProps) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ShippingQuote[]>([]);
  const [error, setError] = useState("");
  const [selectedShipping, setSelectedShipping] = useState<ShippingQuote | null>(null);

  const formatCep = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCep(e.target.value));
    setError("");
    setResults([]);
    setSelectedShipping(null);
  };

  const handleCalculate = async () => {
    const cleanCep = cep.replace("-", "");
    if (cleanCep.length !== 8) {
      setError("CEP inválido. Digite 8 dígitos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: cleanCep }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao calcular frete");
        return;
      }

      if (data.quotes && data.quotes.length > 0) {
        setResults(data.quotes);
        if (data.quotes.length === 1) {
          setSelectedShipping(data.quotes[0]);
        }
      } else {
        setError("Nenhuma opção de frete disponível para este CEP.");
      }
    } catch (err) {
      setError("Erro ao calcular frete. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCalculate();
    }
  };

  return (
    <div className="bg-brand-bg-light rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FiTruck className="text-brand-gold" size={18} />
        <span className="font-sans text-sm font-medium text-text-primary">Calcular Frete</span>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="00000-000"
          value={cep}
          onChange={handleCepChange}
          onKeyDown={handleKeyPress}
          className="flex-1 px-4 py-3 bg-white border border-brand-bg-dark rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
          maxLength={9}
        />
        <button
          onClick={handleCalculate}
          disabled={loading || cep.length < 9}
          className="px-5 py-3 bg-brand-gold text-white rounded-lg font-sans text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Calcular"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs mb-3">
          <FiAlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((shipping) => (
            <label
              key={shipping.id}
              className={`flex items-center justify-between p-3 bg-white rounded-lg border cursor-pointer transition-all ${
                selectedShipping?.id === shipping.id
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-brand-bg-dark hover:border-brand-gold/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  checked={selectedShipping?.id === shipping.id}
                  onChange={() => setSelectedShipping(shipping)}
                  className="text-brand-gold accent-brand-gold"
                />
                <div>
                  <p className="font-sans text-sm font-medium text-text-primary">
                    {shipping.name}
                    {shipping.company && shipping.company !== shipping.name && (
                      <span className="text-text-muted font-normal"> ({shipping.company})</span>
                    )}
                  </p>
                  <p className="font-sans text-xs text-text-muted">
                    {shipping.deliveryTime + 2} dias úteis
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-sans text-sm font-semibold ${shipping.price === 0 ? "text-brand-gold" : "text-text-primary"}`}>
                  {shipping.price === 0 ? "GRÁTIS" : `R$ ${shipping.price.toFixed(2).replace(".", ",")}`}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}

      {selectedShipping && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <FiCheck className="text-green-600" size={16} />
          <span className="text-sm text-green-700">
            Frete selecionado: {selectedShipping.name} - R$ {selectedShipping.price.toFixed(2).replace(".", ",")}
          </span>
        </div>
      )}
    </div>
  );
}