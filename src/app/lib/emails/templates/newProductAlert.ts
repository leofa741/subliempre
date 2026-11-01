export const getNewProductAlertTemplate = (
  userName: string, 
  productName: string, 
  productCategory: string, 
  productUrl: string
) => {
  const brandName = process.env.BRAND_NAME || 'Candy Ilusiones';
  const brandColor = process.env.BRAND_COLOR || '#BE185D';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_APP_URL || 'https://www.candyilusiones.com.ar';
  const tumarcaUrl = 'https://www.tumarca.ar';

  return {
    subject: `✨ ¡Nuevo producto en ${brandName} que te va a encantar!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFBF7; color: #57534E; }
    .header { background: linear-gradient(135deg, #F9A8D4, #FCA5A5); padding: 30px 24px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { color: #881337; margin: 0; font-size: 24px; font-weight: 700; }
    .body { padding: 32px 24px; background: #FFFFFF; border-radius: 0 0 16px 16px; border: 1px solid #FCE7F3; border-top: none; }
    .product-box { background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
    .cta { display: inline-block; background: ${brandColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 700; margin-top: 16px; font-size: 15px; }
    .footer { text-align: center; padding: 24px; color: #A8A29E; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎨 ¡Llegó algo nuevo a ${brandName}!</h1>
  </div>
  <div class="body">
    <p style="font-size: 16px; line-height: 1.6;">Hola <strong style="color: ${brandColor};">${userName}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.6;">Acabamos de agregar un nuevo producto que coincide con tus intereses:</p>
    
    <div class="product-box">
      <p style="margin: 0 0 8px; font-size: 12px; color: #9D174D; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">${productCategory}</p>
      <h2 style="margin: 0 0 16px; color: #881337; font-size: 22px;">${productName}</h2>
      <a href="${productUrl}" class="cta">Ver producto ahora →</a>
    </div>

   
  </div>
  <div class="footer">
    <p style="margin: 0;">© ${new Date().getFullYear()} ${brandName} · Hecho con amor 💜</p>
  </div>
   <p style="font-size: 14px; color: #78716C; text-align: center; margin-top: 24px;">
      Desarrollado por <a href="${tumarcaUrl}" style="color: ${brandColor};">www.tumarca.ar</a>
    </p>
</body>
</html>`,
    text: `¡Llegó algo nuevo a ${brandName}!\n\nHola ${userName}, agregamos un nuevo producto: ${productName} (${productCategory}).\nMíralo aquí: ${productUrl}`
  };
};