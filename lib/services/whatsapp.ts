export interface WhatsAppOrderNotification {
  customerName: string;
  customerPhone: string;
  orderId: number;
  orderUrl: string;
  totalItems: number;
  total: number;
}

export class WhatsAppService {
  private phoneNumberId: string;
  private accessToken: string;
  private adminPhone: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.adminPhone = process.env.ADMIN_WHATSAPP_NUMBER!;
  }

  async sendOrderNotification(data: WhatsAppOrderNotification): Promise<boolean> {
    const message = `
🛒 *NUEVA ORDEN COMPLETADA* 

👤 Cliente: ${data.customerName}
📱 Teléfono: ${data.customerPhone}

📦 Total de productos: ${data.totalItems}
💰 Total: $${data.total.toFixed(2)}

🔗 Ver orden completa:
${data.orderUrl}
    `.trim();

    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: this.adminPhone.replace(/\+/g, ''),
            type: 'text',
            text: {
              preview_url: true,
              body: message,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('WhatsApp API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  async verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null> {
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }

    return null;
  }
}