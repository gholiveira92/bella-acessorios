"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  promotionalPrice?: number;
  quantity: number;
  image: string;
  variation?: Record<string, string>;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deliveryTime: number;
  company?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  cep: string;
  setCep: (cep: string) => void;
  shippingOptions: ShippingOption[];
  selectedShipping: ShippingOption | null;
  setSelectedShipping: (option: ShippingOption | null) => void;
  shippingPrice: number;
  shippingLoading: boolean;
  fetchShippingOptions: () => Promise<void>;
  clearShipping: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        localStorage.removeItem("cart");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isLoading]);

  const clearShipping = () => {
    setCep("");
    setShippingOptions([]);
    setSelectedShipping(null);
  };

  const fetchShippingOptions = async () => {
    if (cep.replace(/\D/g, "").length !== 8) return;

    setShippingLoading(true);
    try {
      const cleanCep = cep.replace(/\D/g, "");
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep: cleanCep,
          weight: 0.5,
          width: 10,
          height: 10,
          length: 10,
          subtotal: 0,
        }),
      });
      const data = await res.json();
      if (data.quotes && data.quotes.length > 0) {
        setShippingOptions(data.quotes);
        setSelectedShipping(data.quotes[0]);
      } else {
        setShippingOptions([]);
        setSelectedShipping(null);
      }
    } catch (error) {
      console.error("Shipping fetch error:", error);
      setShippingOptions([]);
      setSelectedShipping(null);
    } finally {
      setShippingLoading(false);
    }
  };

  const addItem = (item: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, { ...item, id: Math.random().toString(36).substr(2, 9) }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    clearShipping();
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.promotionalPrice || item.price) * item.quantity,
    0
  );
  const shippingPrice = selectedShipping?.price || 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isLoading,
        cep,
        setCep,
        shippingOptions,
        selectedShipping,
        setSelectedShipping,
        shippingPrice,
        shippingLoading,
        fetchShippingOptions,
        clearShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}