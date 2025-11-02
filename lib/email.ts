import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Template para nueva orden
export function newOrderEmailTemplate(orderData: {
  orderId: number;
  userEmail: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}) {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>Nueva Orden Recibida</h2>
        <p><strong>Orden ID:</strong> ${orderData.orderId}</p>
        <p><strong>Cliente:</strong> ${orderData.userEmail}</p>
        <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
        
        <h3>Productos:</h3>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <p><a href="${process.env.NEXTAUTH_URL}/admin/orders">Ver todas las órdenes</a></p>
      </body>
    </html>
  `;
}

// Template para cambios en productos de carritos
export function productChangeEmailTemplate(changeData: {
  type: 'price_change' | 'out_of_stock' | 'deleted';
  productName: string;
  affectedCarts: number;
  details?: string;
}) {
  const typeMessages = {
    price_change: 'Cambió de precio',
    out_of_stock: 'Se quedó sin stock',
    deleted: 'Fue eliminado',
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <h2>⚠️ Cambio en Producto con Carritos Activos</h2>
        <p><strong>Producto:</strong> ${changeData.productName}</p>
        <p><strong>Tipo de cambio:</strong> ${typeMessages[changeData.type]}</p>
        <p><strong>Carritos afectados:</strong> ${changeData.affectedCarts}</p>
        ${changeData.details ? `<p>${changeData.details}</p>` : ''}
        
        <p><a href="${process.env.NEXTAUTH_URL}/admin/orders">Revisar órdenes</a></p>
      </body>
    </html>
  `;
}
