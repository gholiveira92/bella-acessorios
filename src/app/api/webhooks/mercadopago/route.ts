import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db-direct";
import { sendOrderConfirmationEmail } from "@/lib/email";

function validateWebhookSignature(
  payload: string,
  signature: string | null,
  token: string
): boolean {
  if (!signature || !token) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", token)
    .update(payload)
    .digest("hex");

  try {
    const parts = signature.split(",");
    const params: Record<string, string> = {};
    
    for (const part of parts) {
      const [key, value] = part.split("=");
      if (key && value) {
        params[key] = value;
      }
    }

    const hash = params["hs"];
    const ts = params["ts"];

    if (hash !== expectedSignature) {
      return false;
    }

    const tsNum = parseInt(ts || "0", 10);
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesAgo = now - 300;

    if (tsNum < fiveMinutesAgo) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");
    const webhookId = request.headers.get("x-webhook-id");

    const body = JSON.parse(rawBody);
    
    const topic = body.topic || body.type;
    const paymentId = body.id || body.data?.id;

    if (!paymentId) {
      console.log("Webhook received without payment ID");
      return NextResponse.json({ received: true });
    }

    const { default: axios } = await import("axios");
    
    const mpResponse = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = mpResponse.data;
    const externalReference = payment.external_reference;

    if (!externalReference) {
      console.log("Webhook received without external reference");
      return NextResponse.json({ received: true });
    }

    const orderResult = await query(`
      SELECT o.id, o.status, o.total, u.email, u.name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.order_number = $1
      LIMIT 1
    `, [externalReference]);

    if (orderResult.length === 0) {
      console.log(`Webhook: Order not found for reference ${externalReference}`);
      return NextResponse.json({ received: true });
    }

    const order = orderResult[0] as any;

    const paymentResult = await query(`
      SELECT id, webhook_token, transaction_id
      FROM payments
      WHERE order_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [order.id]);

    if (paymentResult.length > 0) {
      const paymentData = paymentResult[0] as any;
      if (paymentData.webhook_token) {
        const isValidPayload = validateWebhookSignature(
          rawBody,
          signature,
          paymentData.webhook_token
        );
        
        if (!isValidPayload) {
          console.log("Webhook: Invalid signature");
        }
      }

      if (paymentData.transaction_id && paymentData.transaction_id !== paymentId.toString()) {
        console.log(`Webhook: Payment ID mismatch. Stored: ${paymentData.transaction_id}, Received: ${paymentId}`);
      }
    }

    const statusMap: Record<string, string> = {
      approved: "PAGO",
      pending: "AGUARDANDO_PAGAMENTO",
      in_process: "AGUARDANDO_PAGAMENTO",
      rejected: "CANCELADO",
      cancelled: "CANCELADO",
      refunded: "CANCELADO",
    };

    const newStatus = statusMap[payment.status] || "AGUARDANDO_PAGAMENTO";

    await query(`UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`, [newStatus, order.id]);

    await query(`
      UPDATE payments 
      SET status = $1, transaction_id = $2, updated_at = NOW()
      WHERE order_id = $3
    `, [newStatus === "PAGO" ? "APPROVED" : "REJECTED", paymentId.toString(), order.id]);

    if (newStatus === "PAGO") {
      const itemsResult = await query(`
        SELECT product_id, quantity FROM order_items WHERE order_id = $1
      `, [order.id]);

      for (const item of itemsResult as any[]) {
        await query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [item.quantity, item.product_id]);
      }

      if (order.email) {
        try {
          const itemsData = await query(`
            SELECT product_name, quantity, unit_price FROM order_items WHERE order_id = $1
          `, [order.id]);

          await sendOrderConfirmationEmail(
            order.email,
            order.name,
            externalReference,
            order.total,
            (itemsData as any[]).map((item: any) => ({
              name: item.product_name,
              quantity: item.quantity,
              price: parseFloat(item.unit_price),
            }))
          );
        } catch (emailError) {
          console.error("Error sending order confirmation email:", emailError);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ received: true });
}