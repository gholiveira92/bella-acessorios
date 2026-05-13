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

async function getJadlogQuotes(cep: string, weight: number, width: number, height: number, length: number): Promise<ShippingOption[]> {
  try {
    const response = await axios.post(
      "https://www.jadlog.com.br/api/v1/shipping/calculate",
      {
        origin: { postal_code: ORIGIN_CEP },
        destination: { postal_code: cep },
        package: {
          weight,
          length,
          width,
          height,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (response.data?.results) {
      return response.data.results.map((item: any) => ({
        id: `jadlog-${item.service}`,
        name: item.service_name || "Jadlog",
        price: parseFloat(item.price),
        currency: "BRL",
        deliveryTime: parseInt(item.delivery_time) || 5,
        company: "Jadlog",
      }));
    }
    return [];
  } catch (error) {
    console.error("Jadlog error:", error);
    return [];
  }
}

async function getAzulQuotes(cep: string, weight: number): Promise<ShippingOption[]> {
  try {
    const response = await axios.post(
      "https://api.azulcargo.com.br/v1/shipping/calculate",
      {
        origin_postal_code: ORIGIN_CEP,
        destination_postal_code: cep,
        weight,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (response.data?.options) {
      return response.data.options.map((item: any) => ({
        id: `azul-${item.id}`,
        name: item.name || "Azul Cargo",
        price: parseFloat(item.price),
        currency: "BRL",
        deliveryTime: parseInt(item.days) || 5,
        company: "Azul Cargo",
      }));
    }
    return [];
  } catch (error) {
    console.error("Azul Cargo error:", error);
    return [];
  }
}

async function getLATAMCargoQuotes(cep: string, weight: number, width: number, height: number, length: number): Promise<ShippingOption[]> {
  try {
    const response = await axios.post(
      "https://api.latamcargo.com.br/v1/shipping/calculate",
      {
        origin: ORIGIN_CEP,
        destination: cep,
        package: {
          weight,
          dimensions: {
            length,
            width,
            height,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (response.data?.rates) {
      return response.data.rates.map((item: any) => ({
        id: `latam-${item.service_code}`,
        name: item.service_name || "LATAM Cargo",
        price: parseFloat(item.total_price),
        currency: "BRL",
        deliveryTime: parseInt(item.estimated_days) || 5,
        company: "LATAM Cargo",
      }));
    }
    return [];
  } catch (error) {
    console.error("LATAM Cargo error:", error);
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

    const promises = [
      getMelhorEnvioQuotes(cep, weight, width, height, length),
      getCorreiosQuotes(cep, weight, width, height, length),
      getJadlogQuotes(cep, weight, width, height, length),
    ];

    const results = await Promise.allSettled(promises);

    let quotes: ShippingOption[] = [];
    const sources: Record<string, boolean> = {};

    const sourceNames = ["melhorEnvio", "correios", "jadlog"];
    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.length > 0) {
        quotes.push(...result.value);
        sources[sourceNames[index]] = true;
      }
    });

    if (quotes.length === 0) {
      console.log("Nenhum frete encontrado, usando fallbacks");
      quotes = [
        { id: "pac", name: "PAC", price: 15.9, currency: "BRL", deliveryTime: 7, company: "Correios" },
        { id: "sedex", name: "SEDEX", price: 25.9, currency: "BRL", deliveryTime: 3, company: "Correios" },
        { id: "jadlog-paquete", name: "Jadlog Paquete", price: 19.9, currency: "BRL", deliveryTime: 5, company: "Jadlog" },
        { id: "jadlog-expresso", name: "Jadlog Expresso", price: 29.9, currency: "BRL", deliveryTime: 2, company: "Jadlog" },
      ];
      sources.fallback = true;
    }

    const seen = new Set<string>();
    quotes = quotes.filter((q) => {
      const key = `${q.company}-${q.name}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    quotes.sort((a, b) => a.price - b.price);

    return NextResponse.json({ 
      quotes,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      currentSubtotal: subtotal,
      source: sources,
    });
  } catch (error) {
    console.error("Shipping quote error:", error);
    
    const fallbackQuotes: ShippingOption[] = [
      { id: "pac", name: "PAC", price: 15.9, currency: "BRL", deliveryTime: 7, company: "Correios" },
      { id: "sedex", name: "SEDEX", price: 25.9, currency: "BRL", deliveryTime: 3, company: "Correios" },
      { id: "jadlog-paquete", name: "Jadlog Paquete", price: 19.9, currency: "BRL", deliveryTime: 5, company: "Jadlog" },
    ];
    
    return NextResponse.json({ 
      quotes: fallbackQuotes,
      fallback: true,
      error: "Erro ao calcular fretes. Valores estimados exibidos."
    });
  }
}