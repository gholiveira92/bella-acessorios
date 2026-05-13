import { NextResponse } from "next/server";
import axios from "axios";

interface ShippingQuoteRequest {
  cep: string;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  subtotal?: number;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  deliveryTime: number;
  deliveryRange?: {
    min: number;
    max: number;
  };
  company: string;
}

const FREE_SHIPPING_THRESHOLD = 299;
const ORIGIN_CEP = "19360000";

async function getMelhorEnvioQuotes(cep: string, weight: number, width: number, height: number, length: number): Promise<ShippingOption[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  
  if (!token || token === "your-token") {
    console.log("Melhor Envio: Token não configurado");
    return [];
  }

  try {
    const response = await axios.post(
      "https://www.melhorenvio.com.br/api/v2/shipping/calculate",
      {
        from: { postal_code: ORIGIN_CEP },
        to: { postal_code: cep },
        products: [{ width, height, length, weight, quantity: 1 }],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("Melhor Envio response:", JSON.stringify(response.data));

    if (Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        currency: "BRL",
        deliveryTime: item.delivery_time || item.company?.delivery_time || 5,
        deliveryRange: item.delivery_range,
        company: item.company?.name || item.name,
      }));
    }
    
    if (response.data?.shipping_options && Array.isArray(response.data.shipping_options)) {
      return response.data.shipping_options.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        currency: "BRL",
        deliveryTime: item.delivery_time || 5,
        deliveryRange: item.delivery_range,
        company: item.company?.name || item.name,
      }));
    }

    return [];
  } catch (error: any) {
    console.error("Melhor Envio error:", error.response?.data || error.message);
    return [];
  }
}

async function getCorreiosQuotes(cep: string, weight: number, width: number, height: number, length: number): Promise<ShippingOption[]> {
  try {
    const payload = {
      cepOrigem: ORIGIN_CEP,
      cepDestino: cep,
      peso: weight,
      comprimento: length,
      largura: width,
      altura: height,
      formato: 1,
    };

    const response = await axios.post(
      "https://www.correios.com.br/api/shipping/v1/calculate",
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    console.log("Correios response:", JSON.stringify(response.data));

    if (response.data?.services) {
      const services = response.data.services.filter((s: any) => s.error === null);
      return services.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price) / 100,
        currency: "BRL",
        deliveryTime: parseInt(item.deliveryTime) || 5,
        company: "Correios",
      }));
    }
    return [];
  } catch (error) {
    console.error("Correios API error:", error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body: ShippingQuoteRequest = await request.json();
    const { cep, weight = 0.5, width = 10, height = 10, length = 10, subtotal = 0 } = body;

    if (!cep || cep.length !== 8) {
      return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
    }

    if (cep.startsWith("19360") || cep === ORIGIN_CEP) {
      const freeQuote: ShippingOption = {
        id: "free-local",
        name: "Frete Grátis (Entrega Local)",
        price: 0,
        currency: "BRL",
        deliveryTime: 3,
        company: "Bella Acessórios",
      };
      return NextResponse.json({ quotes: [freeQuote], freeShippingApplied: true });
    }

    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      const freeQuote: ShippingOption = {
        id: "free-promo",
        name: "Frete Grátis (Promoção)",
        price: 0,
        currency: "BRL",
        deliveryTime: 7,
        company: "Bella Acessórios",
      };
      return NextResponse.json({ quotes: [freeQuote], freeShippingApplied: true, reason: `Frete grátis aplicado: compras acima de R$ ${FREE_SHIPPING_THRESHOLD}` });
    }

    const [melhorEnvioQuotes, correiosQuotes] = await Promise.allSettled([
      getMelhorEnvioQuotes(cep, weight, width, height, length),
      getCorreiosQuotes(cep, weight, width, height, length),
    ]);

    let quotes: ShippingOption[] = [];

    if (melhorEnvioQuotes.status === "fulfilled") {
      quotes.push(...melhorEnvioQuotes.value);
    }

    if (correiosQuotes.status === "fulfilled") {
      quotes.push(...correiosQuotes.value);
    }

    if (quotes.length === 0) {
      console.log("Nenhum frete encontrado, usando fallbacks");
      quotes = [
        { id: "pac", name: "PAC", price: 15.9, currency: "BRL", deliveryTime: 7, company: "Correios (Estimado)" },
        { id: "sedex", name: "SEDEX", price: 25.9, currency: "BRL", deliveryTime: 3, company: "Correios (Estimado)" },
      ];
    }

    const seen = new Set<string>();
    quotes = quotes.filter((q) => {
      const key = `${q.company}-${q.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    quotes.sort((a, b) => a.price - b.price);

    return NextResponse.json({ 
      quotes,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      currentSubtotal: subtotal,
      source: {
        melhorEnvio: melhorEnvioQuotes.status === "fulfilled" && melhorEnvioQuotes.value.length > 0,
        correios: correiosQuotes.status === "fulfilled" && correiosQuotes.value.length > 0,
      }
    });
  } catch (error) {
    console.error("Shipping quote error:", error);
    
    const fallbackQuotes: ShippingOption[] = [
      { id: "pac", name: "PAC", price: 15.9, currency: "BRL", deliveryTime: 7, company: "Correios" },
      { id: "sedex", name: "SEDEX", price: 25.9, currency: "BRL", deliveryTime: 3, company: "Correios" },
    ];
    
    return NextResponse.json({ 
      quotes: fallbackQuotes,
      fallback: true,
      error: "Erro ao calcular fretes. Valores estimados exibidos."
    });
  }
}