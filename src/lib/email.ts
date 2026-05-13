import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(email: string, name: string, token: string) {
  const confirmUrl = `${process.env.NEXTAUTH_URL}/auth/confirm?token=${token}&email=${encodeURIComponent(email)}`;

  await resend.emails.send({
    from: "Bella Acessórios <noreply@bella-acessorios.com.br>",
    to: email,
    subject: "Confirme seu e-mail - Bella Acessórios",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F7F2EA;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F2EA; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h1 style="color: #C8A269; font-size: 24px; margin: 0 0 20px 0; font-family: Georgia, serif;">
                        Bella Acessórios
                      </h1>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Olá ${name},
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Obrigado por se cadastrar na Bella Acessórios! Para confirmar seu e-mail e ativar sua conta, clique no botão abaixo:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${confirmUrl}" style="display: inline-block; background-color: #C8A269; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 25px; font-size: 16px; font-weight: bold;">
                              Confirmar E-mail
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #6E6259; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                        Se você não criou uma conta na Bella Acessórios, pode ignorar este e-mail.
                      </p>
                      <p style="color: #6E6259; font-size: 12px; line-height: 1.6; margin: 20px 0 0 0; border-top: 1px solid #eee; padding-top: 20px;">
                        Este e-mail foi enviado pela Bella Acessórios.<br>
                        Acesse: <a href="${process.env.NEXTAUTH_URL}" style="color: #C8A269;">bella-acessorios.com.br</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  total: number,
  items: { name: string; quantity: number; price: number }[]
) {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
          <span style="color: #333333;">${item.name}</span>
          <span style="color: #6E6259; font-size: 14px;"> x${item.quantity}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">
          <span style="color: #333333;">R$ ${item.price.toFixed(2).replace(".", ",")}</span>
        </td>
      </tr>
    `
    )
    .join("");

  await resend.emails.send({
    from: "Bella Acessórios <noreply@bella-acessorios.com.br>",
    to: email,
    subject: `Pedido ${orderNumber} confirmado - Bella Acessórios`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F7F2EA;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F2EA; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h1 style="color: #C8A269; font-size: 24px; margin: 0 0 20px 0; font-family: Georgia, serif;">
                        Bella Acessórios
                      </h1>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                        Olá ${name},
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Seu pedido foi recebido com sucesso!
                      </p>
                      <div style="background-color: #F7F2EA; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <p style="color: #6E6259; font-size: 14px; margin: 0;">
                          <strong style="color: #333333;">Número do pedido:</strong> ${orderNumber}
                        </p>
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                        ${itemsHtml}
                      </table>
                      <div style="border-top: 2px solid #C8A269; padding-top: 20px; margin-top: 20px;">
                        <p style="color: #333333; font-size: 18px; margin: 0; text-align: right;">
                          <strong>Total: R$ ${total.toFixed(2).replace(".", ",")}</strong>
                        </p>
                      </div>
                      <p style="color: #6E6259; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                        Em breve você receberá atualizações sobre o status do seu pedido.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}