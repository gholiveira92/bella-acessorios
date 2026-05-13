"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiTruck, FiCreditCard, FiLock } from "react-icons/fi";
import MercadoPagoCardForm from "@/components/checkout/MercadoPagoCardForm";

type Step = "address" | "shipping" | "payment" | "review";

interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, subtotal, clearCart, cep: cartCep, shippingOptions: cartShippingOptions, selectedShipping: cartSelectedShipping, shippingPrice } = useCart();

  const [step, setStep] = useState<Step>("address");
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState<Address>({
    cep: cartCep || "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [shippingOptions, setShippingOptions] = useState<{ id: string; name: string; price: number; deadline: number; company?: string }[]>(cartShippingOptions.length > 0 ? cartShippingOptions.map(o => ({...o, deadline: o.deliveryTime || 5})) : []);
  const [selectedShipping, setSelectedShipping] = useState<{ id: string; name: string; price: number; deadline: number } | null>(cartSelectedShipping ? { id: cartSelectedShipping.id, name: cartSelectedShipping.name, price: cartSelectedShipping.price, deadline: cartSelectedShipping.deliveryTime || 5 } : null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [usedCartShipping, setUsedCartShipping] = useState(cartSelectedShipping !== null);

  const fetchShippingOptions = async (cep: string) => {
    if (cep.length !== 8) return;

    setShippingLoading(true);

    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep,
          weight: 0.5,
          width: 10,
          height: 10,
          length: 10,
          subtotal,
        }),
      });

      const data = await res.json();

      if (data.quotes && data.quotes.length > 0) {
        const options = data.quotes.map((q: any) => ({
          id: q.id,
          name: q.name,
          price: q.price,
          deadline: q.deliveryTime,
          company: q.company,
        }));
        setShippingOptions(options);
        setSelectedShipping(options[0]);
      } else {
        setShippingOptions([
          { id: "pac", name: "PAC", price: 15.9, deadline: 7 },
          { id: "sedex", name: "SEDEX", price: 25.9, deadline: 3 },
        ]);
      }
    } catch (error) {
      console.error("Erro ao buscar fretes:", error);
      setShippingOptions([
        { id: "pac", name: "PAC", price: 15.9, deadline: 7 },
        { id: "sedex", name: "SEDEX", price: 25.9, deadline: 3 },
      ]);
    } finally {
      setShippingLoading(false);
    }
  };

  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [pixData, setPixData] = useState<{ qrCode: string; copyPaste: string } | null>(null);

  const shippingCost = selectedShipping?.price || 0;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (items.length === 0 && !orderCreated) {
      router.push("/cart");
    }
  }, [items, orderCreated, router]);

  const handleCepChange = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, "");
    setAddress((prev) => ({ ...prev, cep: cleaned }));
    setUsedCartShipping(false);

    if (cleaned.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddress((prev) => ({
            ...prev,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching CEP:", error);
      }
      fetchShippingOptions(cleaned);
    }
  };

  const validateAddress = () => {
    return (
      address.cep.length === 8 &&
      address.street &&
      address.number &&
      address.neighborhood &&
      address.city &&
      address.state
    );
  };

  const handleCardPayment = (token: string, installment: number) => {
    setCardToken(token);
    setStep("review");
  };

  const handleCardError = (error: string) => {
    alert(error);
  };

  const handleCreateOrder = async () => {
    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.promotionalPrice || item.price,
        quantity: item.quantity,
      }));

      const payload: any = {
        items: orderItems,
        address,
        shippingOption: selectedShipping,
        paymentMethod,
      };

      if (paymentMethod === "card" && cardToken) {
        payload.cardToken = cardToken;
        payload.installment = 1;
      }

      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao criar pedido");
        setLoading(false);
        return;
      }

      setOrderNumber(data.orderNumber);
      if (paymentMethod === "pix" && data.pixQrCode) {
        setPixData({
          qrCode: data.pixQrCode,
          copyPaste: data.pixCopyPaste || "",
        });
      }
      if (paymentMethod === "card") {
        if (data.success) {
          setOrderCreated(true);
          clearCart();
        } else {
          alert(data.error || "Pagamento recusado");
          setLoading(false);
          return;
        }
      } else {
        setOrderCreated(true);
        clearCart();
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Erro ao processar pedido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) {
      router.push("/auth/login?callbackUrl=/checkout");
    }
  }, [session, router]);

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-3xl font-serif text-gray-800 mb-4">Pedido Realizado!</h1>
          <p className="text-gray-600 mb-2">Obrigado pela sua compra!</p>
          <p className="text-gray-600 mb-8">
            Número do pedido: <span className="font-semibold">{orderNumber}</span>
          </p>

          {paymentMethod === "pix" && (
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Pagamento via PIX</h3>
              <p className="text-sm text-gray-600 mb-4">
                O código PIX foi enviado para seu e-mail. Escaneie o QR Code ou copie o código abaixo:
              </p>
              {pixData?.qrCode && (
                <div className="mb-4">
                  <img
                    src={`data:image/png;base64,${pixData.qrCode}`}
                    alt="QR Code PIX"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              )}
              {pixData?.copyPaste && (
                <div className="bg-white p-4 rounded border text-sm font-mono break-all">
                  {pixData.copyPaste}
                </div>
              )}
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="bg-green-50 p-6 rounded-lg mb-8">
              <FiCheck className="text-green-600 text-3xl mx-auto mb-2" />
              <p className="text-green-700">Pagamento aprovado! Seu pedido foi confirmado.</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Link
              href="/my-orders"
              className="bg-brand-gold text-white py-3 px-6 rounded-full hover:bg-brand-gold-dark transition-colors"
            >
              Ver Meus Pedidos
            </Link>
            <Link href="/catalog" className="text-brand-gold hover:underline">
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="text-gray-500 hover:text-brand-gold">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-serif text-rose-800">Finalizar Compra</h1>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === "address" ? "text-brand-gold" : "text-gray-400"}`}>
            <div className="w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm">1</div>
            <span className="text-sm">Endereço</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step === "shipping" ? "text-brand-gold" : "text-gray-400"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step === "shipping" || step === "payment" || step === "review" ? "bg-brand-gold text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              2
            </div>
            <span className="text-sm">Frete</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step === "payment" ? "text-brand-gold" : "text-gray-400"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step === "payment" || step === "review" ? "bg-brand-gold text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              3
            </div>
            <span className="text-sm">Pagamento</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === "address" && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Endereço de Entrega</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={address.cep}
                        onChange={(e) => {
                          handleCepChange(e.target.value);
                          const cleanCep = e.target.value.replace(/\D/g, "");
                          if (cleanCep.length === 8) {
                            fetchShippingOptions(cleanCep);
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        placeholder="00000000"
                        maxLength={8}
                      />
                      {shippingLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rua *</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress((prev) => ({ ...prev, street: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      placeholder="Rua/Avenida"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
                      <input
                        type="text"
                        value={address.number}
                        onChange={(e) => setAddress((prev) => ({ ...prev, number: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                      <input
                        type="text"
                        value={address.complement}
                        onChange={(e) => setAddress((prev) => ({ ...prev, complement: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        placeholder="Apto/Bloco"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bairro *</label>
                    <input
                      type="text"
                      value={address.neighborhood}
                      onChange={(e) => setAddress((prev) => ({ ...prev, neighborhood: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      placeholder="Bairro"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        placeholder="Cidade"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => validateAddress() && setStep("shipping")}
                    disabled={!validateAddress()}
                    className="w-full bg-brand-gold text-white py-3 rounded-lg hover:bg-brand-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar para Frete
                  </button>
                </div>
              </div>
            )}

            {step === "shipping" && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FiTruck /> Forma de Entrega
                </h2>

                {cartSelectedShipping?.price === 0 && usedCartShipping && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium text-sm">
                      🎉 Você ganhou frete grátis!
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {shippingOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedShipping?.id === option.id
                          ? "border-brand-gold bg-brand-bg-light"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShipping?.id === option.id}
                            onChange={() => setSelectedShipping(option)}
                            className="text-brand-gold"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{option.name}</p>
                            <p className="text-sm text-gray-500">{option.deadline} úteis</p>
                          </div>
                        </div>
                        <span className="font-semibold text-brand-gold">{option.price === 0 ? "GRÁTIS" : `R$ ${option.price.toFixed(2).replace(".", ",")}`}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep("address")}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setStep("payment")}
                    className="flex-1 bg-brand-gold text-white py-3 rounded-lg hover:bg-brand-gold-dark transition-colors"
                  >
                    Continuar para Pagamento
                  </button>
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FiCreditCard /> Forma de Pagamento
                </h2>

                <div className="space-y-3 mb-6">
                  <label
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "pix" ? "border-brand-gold bg-brand-bg-light" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "pix"}
                        onChange={() => {
                          setPaymentMethod("pix");
                          setCardToken(null);
                        }}
                        className="text-brand-gold"
                      />
                      <span className="font-medium text-gray-800">PIX</span>
                    </div>
                  </label>

                  <label
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "card" ? "border-brand-gold bg-brand-bg-light" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "card"}
                        onChange={() => {
                          setPaymentMethod("card");
                          setCardToken(null);
                        }}
                        className="text-brand-gold"
                      />
                      <span className="font-medium text-gray-800">Cartão de Crédito</span>
                    </div>
                  </label>
                </div>

                {paymentMethod === "card" && session?.user?.email && (
                  <MercadoPagoCardForm
                    userEmail={session.user.email}
                    onSubmit={handleCardPayment}
                    onError={handleCardError}
                    total={total}
                  />
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep("shipping")}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => {
                      if (paymentMethod === "pix") {
                        setStep("review");
                      } else if (!cardToken) {
                        alert("Preencha os dados do cartão");
                      }
                    }}
                    disabled={paymentMethod === "card" && !cardToken}
                    className="flex-1 bg-brand-gold text-white py-3 rounded-lg hover:bg-brand-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Revisar Pedido
                  </button>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Revisão do Pedido</h2>

                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-800 mb-2">Endereço de Entrega</h3>
                    <p className="text-gray-600 text-sm">
                      {address.street}, {address.number}
                      {address.complement && `, ${address.complement}`}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {address.neighborhood} - {address.city}/{address.state}
                    </p>
                    <p className="text-gray-600 text-sm">CEP: {address.cep}</p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-800 mb-2">Frete</h3>
                    <p className="text-gray-600 text-sm">
                      {selectedShipping?.name} - {selectedShipping?.deadline} úteis
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-800 mb-2">Pagamento</h3>
                    <p className="text-gray-600 text-sm">{paymentMethod === "pix" ? "PIX" : "Cartão de Crédito"}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Itens ({items.length})</h3>
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm py-2">
                        <span className="text-gray-600">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="text-gray-800">
                          R$ {((item.promotionalPrice || item.price) * item.quantity).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep("payment")}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="flex-1 bg-brand-gold text-white py-3 rounded-lg hover:bg-brand-gold-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiLock /> Finalizar Pedido
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumo do Pedido</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} itens)</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span>R$ {shippingCost.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-gray-800">
                  <span>Total</span>
                  <span className="text-brand-gold text-xl">R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}