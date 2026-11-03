export const getNewDesignRequestAlertTemplate = (
  clientName: string,
  productType: string,
  designTitle: string,
  adminPanelUrl: string,
  disenoId: string
) => {
  const brandName = process.env.BRAND_NAME || 'Candy Ilusiones';
  const brandColor = process.env.BRAND_COLOR || '#BE185D';
  const reviewUrl = `${adminPanelUrl}/gestion/diseno-personalizado/${disenoId}`;

  return {
    subject: `🎨 ¡Nueva solicitud de diseño personalizado de ${clientName}!`,
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
    .info-box { background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .info-label { color: #9D174D; font-weight: 600; }
    .info-value { color: #44403C; font-weight: 500; text-align: right; }
    .cta { display: inline-block; background: ${brandColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 700; margin-top: 16px; font-size: 15px; text-align: center; width: 100%; box-sizing: border-box; }
    .footer { text-align: center; padding: 24px; color: #A8A29E; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎨 ¡Nueva Solicitud de Diseño!</h1>
  </div>
  <div class="body">
    <p style="font-size: 16px; line-height: 1.6;">Hola <strong>Administrador</strong>,</p>
    <p style="font-size: 16px; line-height: 1.6;">Se ha recibido una nueva solicitud de diseño personalizado en el sitio web.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Cliente:</span>
        <span class="info-value">${clientName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Producto:</span>
        <span class="info-value">${productType}</span>
      </div>
      <div class="info-row" style="margin-bottom: 0;">
        <span class="info-label">Título:</span>
        <span class="info-value">${designTitle}</span>
      </div>
    </div>

    <p style="font-size: 14px; color: #78716C; line-height: 1.6; margin-bottom: 20px;">
      Por favor, revisa los detalles, las imágenes de referencia y responde al cliente a la brevedad desde el panel de administración.
    </p>

    <a href="${reviewUrl}" class="cta">Revisar y Responder Solicitud →</a>
  </div>
  <div class="footer">
    <p style="margin: 0 0 8px; font-weight: 700; color: ${brandColor}; font-size: 14px;">${brandName} - Panel de Administración</p>
    <p style="margin: 0;">© ${new Date().getFullYear()} · Hecho con amor 💜</p>
  </div>
</body>
</html>`,
    text: `¡Nueva Solicitud de Diseño!\n\nCliente: ${clientName}\nProducto: ${productType}\nTítulo: ${designTitle}\n\nRevisa la solicitud en el panel de administración: ${reviewUrl}`
  };
};