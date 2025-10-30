// Configuración base para integración WhatsApp Cloud API
import axios from 'axios';

export async function sendOrderNotification({ customerName, customerPhone, orderId }: { customerName: string, customerPhone: string, orderId: string }) {
  const url = `https://graph.facebook.com/v18.0/${process.env.WA_PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to: process.env.ADMIN_WHATSAPP_NUMBER,
    type: "template",
    template: {
      name: "order_completed",
      language: { code: "es_AR" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: customerName },
            { type: "text", text: customerPhone },
            { type: "text", text: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${orderId}` }
          ]
        }
      ]
    }
  };
  await axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${process.env.WA_CLOUD_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
}
