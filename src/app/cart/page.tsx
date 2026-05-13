"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { FiTrash2, FiShoppingBag, FiArrowLeft } from "react-icons/fi";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, isLoading } = useCart();

  const shipping = items.length > 0 ? 15.9 : 0;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <FiShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-serif text-text-primary mb-4">Seu carrinho está vazio</h1>
          <p className="text-text-muted mb-8">Adicione produtos para continuar comprando</p>
          <Link
            href="/catalog"
            className="inline-block bg-brand-gold text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Ver Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/catalog" className="text-text-muted hover:text-brand-gold">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-serif text-text-primary">Carrinho</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white rounded-lg border border-brand-bg-dark">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">{item.name}</h3>
                    <p className="text-brand-gold-dark font-semibold mt-1">
                      R$ {(item.promotionalPrice || item.price).toFixed(2).replace(".", ",")}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center border border-brand-bg-dark rounded bg-brand-bg-light">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-3 py-1 text-text-secondary hover:text-brand-gold"
                        >
                          -
                        </button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-3 py-1 text-text-secondary hover:text-brand-gold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-text-muted hover:text-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg sticky top-24 border border-brand-bg-dark">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal ({items.length} itens)</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Frete</span>
                  <span>R$ {shipping.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-text-primary">
                  <span>Total</span>
                  <span className="text-brand-gold-dark">R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-brand-gold text-white text-center py-3 rounded-full hover:opacity-90 transition-opacity"
              >
                Finalizar Compra
              </Link>

              <Link
                href="/catalog"
                className="block w-full text-center text-brand-gold py-2 mt-2 hover:underline"
              >
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}