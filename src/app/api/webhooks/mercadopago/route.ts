import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
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

    const order = await prisma.order.findUnique({
      where: { orderNumber: externalReference },
      include: {
        user: true,
        items: true,
        payment: true,
      },
    });

    if (!order) {
      console.log(`Webhook: Order not found for reference ${externalReference}`);
      return NextResponse.json({ received: true });
    }

    if (order.payment?.webhookToken) {
      const isValidPayload = validateWebhookSignature(
        rawBody,
        signature,
        order.payment.webhookToken
      );
      
      if (!isValidPayload) {
        console.log("Webhook: Invalid signature");
      }
    }

    if (order.payment?.transactionId && order.payment.transactionId !== paymentId.toString()) {
      console.log(`Webhook: Payment ID mismatch. Stored: ${order.payment.transactionId}, Received: ${paymentId}`);
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

    await prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus },
    });

    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: {
        status: newStatus === "PAGO" ? "APPROVED" : "REJECTED",
        transactionId: paymentId.toString(),
      },
    });

    if (newStatus === "PAGO") {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      if (order.user?.email) {
        try {
          await sendOrderConfirmationEmail(
            order.user.email,
            order.user.name,
            order.orderNumber,
            order.total,
            order.items.map((item) => ({
              name: item.productName,
              quantity: item.quantity,
              price: item.unitPrice,
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