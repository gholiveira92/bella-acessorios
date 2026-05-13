"use client";

import { useEffect } from "react";

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string;
  price: number;
  priceCurrency?: string;
  availability?: string;
  url: string;
}

export default function ProductJsonLd({
  name,
  description,
  image,
  price,
  priceCurrency = "BRL",
  availability = "https://schema.org/InStock",
  url,
}: ProductJsonLdProps) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      description,
      image,
      url,
      offers: {
        "@type": "Offer",
        price,
        priceCurrency,
        availability,
        seller: {
          "@type": "Organization",
          name: "Bella Acessórios",
        },
      },
      brand: {
        "@type": "Brand",
        name: "Bella Acessórios",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    script.id = "product-jsonld";
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById("product-jsonld");
      if (existing) existing.remove();
    };
  }, [name, description, image, price, priceCurrency, availability, url]);

  return null;
}