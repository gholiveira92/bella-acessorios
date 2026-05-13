import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";

function generateWebhookToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, address, shippingOption, paymentMethod, cardToken, installment } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Carrinho vazio" },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const shippingPrice = shippingOption?.price || 0;
    const total = subtotal + shippingPrice;

    const orderNumber = "BELLA-" + Date.now().toString(36).toUpperCase();

    let addressRecord;
    const existingAddress = await prisma.address.findFirst({
      where: {
        userId: session.user.id,
        cep: address.cep,
        street: address.street,
        number: address.number,
      },
    });

    if (existingAddress) {
      addressRecord = existingAddress;
    } else {
      addressRecord = await prisma.address.create({
        data: {
          userId: session.user.id,
          cep: address.cep,
          street: address.street,
          number: address.number,
          complement: address.complement || "",
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
        },
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        addressId: addressRecord.id,
        subtotal,
        shippingPrice,
        total,
        shippingProvider: shippingOption?.name || "PAC",
        shippingDeadline: shippingOption?.deadline || 5,
        status: "AGUARDANDO_PAGAMENTO",
      },
    });

    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.price * item.quantity,
        },
      });
    }

    if (paymentMethod === "pix") {
      const webhookToken = generateWebhookToken();
      
      const mpResponse = await axios.post(
        "https://api.mercadopago.com/v1/payments",
        {
          transaction_amount: total,
          payment_method_id: "pix",
          payer: {
            email: session.user.email || "",
          },
          external_reference: orderNumber,
          description: `Pedido Bella Acessórios - ${orderNumber}`,
          notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const mpPayment = mpResponse.data;

      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: "MERCADOPAGO",
          method: "PIX",
          status: mpPayment.status === "pending" ? "PENDING" : mpPayment.status.toUpperCase(),
          transactionId: mpPayment.id?.toString(),
          webhookToken,
          pixQrCode: mpPayment.point_of_interaction?.transaction_data?.qr_code_base64 || "",
          pixCopyPaste: mpPayment.point_of_interaction?.transaction_data?.qr_code || "",
        },
      });
    } else if (paymentMethod === "card" && cardToken) {
      const webhookToken = generateWebhookToken();
      
      try {
        const cardResponse = await axios.post(
          "https://api.mercadopago.com/v1/payments",
          {
            transaction_amount: total,
            payment_method_id: "credit_card",
            token: cardToken,
            payer: {
              email: session.user.email || "",
            },
            external_reference: orderNumber,
            description: `Pedido Bella Acessórios - ${orderNumber}`,
            notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
            installments: installment || 1,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        const mpPayment = cardResponse.data;
        
        const paymentStatus = mpPayment.status === "approved" ? "APPROVED" : 
                             mpPayment.status === "in_process" ? "PENDING" : "REJECTED";

        await prisma.payment.create({
          data: {
            orderId: order.id,
            provider: "MERCADOPAGO",
            method: "CARD",
            status: paymentStatus,
            transactionId: mpPayment.id?.toString(),
            webhookToken,
            installment: installment || 1,
          },
        });

        if (paymentStatus === "APPROVED") {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "PAGO" },
          });

          for (const item of items) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }

        return NextResponse.json({
          success: paymentStatus === "APPROVED",
          orderNumber: order.orderNumber,
          orderId: order.id,
          paymentStatus,
          statusDetail: mpPayment.status_detail,
        });
      } catch (cardError: any) {
        console.error("Card payment error:", cardError.response?.data || cardError.message);
        
        await prisma.payment.create({
          data: {
            orderId: order.id,
            provider: "MERCADOPAGO",
            method: "CARD",
            status: "REJECTED",
            webhookToken,
            installment: installment || 1,
          },
        });

        const errorMessage = cardError.response?.data?.message || "Erro ao processar cartão";
        return NextResponse.json(
          { error: errorMessage, declined: true },
          { status: 400 }
        );
      }
    } else {
      const webhookToken = generateWebhookToken();
      
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: "MERCADOPAGO",
          method: "CARD",
          status: "PENDING",
          webhookToken,
        },
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { orderId: order.id },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      pixQrCode: payment?.pixQrCode || "",
      pixCopyPaste: payment?.pixCopyPaste || "",
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento" },
      { status: 500 }
    );
  }
}