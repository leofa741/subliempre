export const getProductUpdateAlertTemplate = (
    userName: string,
    productName: string,
    productCategory: string,
    productUrl: string,
    updatedFields: string[]
) => {
    const brandName = process.env.BRAND_NAME || 'Candy Ilusiones';
    const brandColor = process.env.BRAND_COLOR || '#BE185D';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_APP_URL || 'https://www.candyilusiones.com.ar';
    const tumarcaUrl = 'https://www.tumarca.ar';

    const fieldsText = updatedFields.length === 1
        ? updatedFields[0]
        : updatedFields.slice(0, -1).join(', ') + ' y ' + updatedFields[updatedFields.length - 1];

    return {
        subject: `🔄 Actualización en ${brandName}: ${productName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFBF7; color: #57534E; }
    .header { background: linear-gradient(135deg, #FCA5A5, #FDE68A); padding: 30px 24px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { color: #881337; margin: 0; font-size: 24px; font-weight: 700; }
    .body { padding: 32px 24px; background: #FFFFFF; border-radius: 0 0 16px 16px; border: 1px solid #FCE7F3; border-top: none; }
    .product-box { background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .update-info { background: #ECFDF5; border-left: 4px solid #10B981; padding: 12px 16px; margin: 16px 0; border-radius: 4px; }
    .cta { display: inline-block; background: ${brandColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 700; margin-top: 16px; font-size: 15px; }
    .footer { text-align: center; padding: 24px; color: #A8A29E; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔄 Hemos actualizado un producto</h1>
  </div>
  <div class="body">
    <p style="font-size: 16px; line-height: 1.6;">Hola <strong style="color: ${brandColor};">${userName}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.6;">Hay novedades en uno de los productos que te interesan:</p>
    
    <div class="product-box">
      <p style="margin: 0 0 8px; font-size: 12px; color: #9D174D; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">${productCategory}</p>
      <h2 style="margin: 0; color: #881337; font-size: 22px;">${productName}</h2>
      
      <div class="update-info">
        <p style="margin: 0; color: #047857; font-size: 14px; font-weight: 600;">
          ✨ Se actualizó: ${fieldsText}
        </p>
      </div>
      
      <div style="text-align: center;">
        <a href="${productUrl}" class="cta">Ver los cambios →</a>
      </div>
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
        text: `¡Actualización en ${brandName}!\n\nHola ${userName}, hemos actualizado ${fieldsText} del producto: ${productName} (${productCategory}).\nMira los cambios aquí: ${productUrl}`
    };
};