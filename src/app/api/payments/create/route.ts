import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db-direct";

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bella-acessorios.vercel.app";

    const existingAddress = await query(`
      SELECT id FROM addresses 
      WHERE user_id = $1 AND cep = $2 AND street = $3 AND number = $4
      LIMIT 1
    `, [session.user.id, address.cep, address.street, address.number]);

    let addressId;
    if (existingAddress.length > 0) {
      addressId = (existingAddress[0] as any).id;
    } else {
      const addressResult = await query(`
        INSERT INTO addresses (id, user_id, cep, street, number, complement, neighborhood, city, state, created_at, updated_at)
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id
      `, [
        session.user.id,
        address.cep,
        address.street,
        address.number,
        address.complement || "",
        address.neighborhood,
        address.city,
        address.state
      ]);
      addressId = addressResult[0].id;
    }

    const orderResult = await query(`
      INSERT INTO orders (id, order_number, user_id, address_id, subtotal, shipping_price, total, shipping_provider, shipping_deadline, status, created_at, updated_at)
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id
    `, [
      orderNumber,
      session.user.id,
      addressId,
      subtotal,
      shippingPrice,
      total,
      shippingOption?.name || "PAC",
      shippingOption?.deadline || 5,
      "AGUARDANDO_PAGAMENTO"
    ]);
    const orderId = orderResult[0].id;

    for (const item of items) {
      await query(`
        INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total, created_at)
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, NOW())
      `, [orderId, item.productId, item.name, item.quantity, item.price, item.price * item.quantity]);
    }

    if (paymentMethod === "pix") {
      const webhookToken = generateWebhookToken();

      console.log(`[PIX] Creating payment for order ${orderNumber}, total: ${total}, email: ${session.user.email}`);

      const idempotencyKey = orderNumber + "-" + Date.now();

      try {
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
            notification_url: `${siteUrl}/api/webhooks/mercadopago`,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
              "X-Idempotency-Key": idempotencyKey,
            },
          }
        );

        const mpPayment = mpResponse.data;
        console.log(`[PIX] Mercado Pago response:`, JSON.stringify(mpPayment));

        if (!mpPayment || !mpPayment.id) {
          console.error("[PIX] Invalid payment response:", mpPayment);
          await query(`DELETE FROM orders WHERE id = $1`, [orderId]);
          return NextResponse.json({
            error: mpPayment?.message || "Erro ao processar pagamento PIX",
            details: mpPayment
          }, { status: 500 });
        }

        const qrCodeBase64 = mpPayment?.point_of_interaction?.transaction_data?.qr_code_base64 || "";
        const qrCodeCopyPaste = mpPayment?.point_of_interaction?.transaction_data?.qr_code || "";

        await query(`
          INSERT INTO payments (id, order_id, provider, method, status, transaction_id, webhook_token, pix_qr_code, pix_copy_paste, created_at, updated_at)
          VALUES (gen_random_uuid()::text, $1, 'MERCADOPAGO', 'PIX', $2, $3, $4, $5, $6, NOW(), NOW())
        `, [
          orderId,
          mpPayment.status === "pending" ? "PENDING" : mpPayment.status.toUpperCase(),
          mpPayment.id?.toString(),
          webhookToken,
          qrCodeBase64,
          qrCodeCopyPaste
        ]);
      } catch (pixError: any) {
        console.error("[PIX] Payment error:", pixError.response?.data || pixError.message);
        await query(`DELETE FROM orders WHERE id = $1`, [orderId]);
        return NextResponse.json({
          error: pixError.response?.data?.message || "Erro ao processar pagamento PIX",
          details: pixError.response?.data || pixError.message
        }, { status: 500 });
      }
    } else if (paymentMethod === "card" && cardToken) {
      const webhookToken = generateWebhookToken();
      const cardIdempotencyKey = orderNumber + "-card-" + Date.now();
      
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
            installments: installment || 1,
            notification_url: `${siteUrl}/api/webhooks/mercadopago`,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
              "X-Idempotency-Key": cardIdempotencyKey,
            },
          }
        );

        const mpPayment = cardResponse.data;
        
        const paymentStatus = mpPayment.status === "approved" ? "APPROVED" : 
                             mpPayment.status === "in_process" ? "PENDING" : "REJECTED";

        await query(`
          INSERT INTO payments (id, order_id, provider, method, status, transaction_id, webhook_token, installment, created_at, updated_at)
          VALUES (gen_random_uuid()::text, $1, 'MERCADOPAGO', 'CARD', $2, $3, $4, $5, NOW(), NOW())
        `, [orderId, paymentStatus, mpPayment.id?.toString(), webhookToken, installment || 1]);

        if (paymentStatus === "APPROVED") {
          await query(`UPDATE orders SET status = 'PAGO', updated_at = NOW() WHERE id = $1`, [orderId]);

          for (const item of items) {
            await query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [item.quantity, item.productId]);
          }
        }

        return NextResponse.json({
          success: paymentStatus === "APPROVED",
          orderNumber: orderNumber,
          orderId: orderId,
          paymentStatus,
          statusDetail: mpPayment.status_detail,
        });
      } catch (cardError: any) {
        console.error("Card payment error:", cardError.response?.data || cardError.message);
        
        await query(`
          INSERT INTO payments (id, order_id, provider, method, status, webhook_token, installment, created_at, updated_at)
          VALUES (gen_random_uuid()::text, $1, 'MERCADOPAGO', 'CARD', 'REJECTED', $2, $3, NOW(), NOW())
        `, [orderId, webhookToken, installment || 1]);

        const errorMessage = cardError.response?.data?.message || "Erro ao processar cartão";
        return NextResponse.json(
          { error: errorMessage, declined: true },
          { status: 400 }
        );
      }
    } else {
      const webhookToken = generateWebhookToken();
      
      await query(`
        INSERT INTO payments (id, order_id, provider, method, status, webhook_token, created_at, updated_at)
        VALUES (gen_random_uuid()::text, $1, 'MERCADOPAGO', 'CARD', 'PENDING', $2, NOW(), NOW())
      `, [orderId, webhookToken]);
    }

    const payment = await query(`SELECT pix_qr_code, pix_copy_paste FROM payments WHERE order_id = $1 LIMIT 1`, [orderId]);

    return NextResponse.json({
      success: true,
      orderNumber: orderNumber,
      orderId: orderId,
      pixQrCode: payment[0]?.pix_qr_code || "",
      pixCopyPaste: payment[0]?.pix_copy_paste || "",
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento" },
      { status: 500 }
    );
  }
}