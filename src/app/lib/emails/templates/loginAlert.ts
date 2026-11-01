export const getLoginAlertTemplate = (to: string) => {
    const brandName = process.env.BRAND_NAME || 'Candy Ilusiones';
    const brandColor = process.env.BRAND_COLOR || '#BE185D';
    const brandLocation = process.env.BRAND_LOCATION || 'Buenos Aires, Argentina';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_APP_URL || 'https://www.candyilusiones.com.ar';
    const tumarcaUrl = 'https://www.tumarca.ar';

    return {
        subject: `🔔 Nuevo inicio de sesión detectado en ${brandName}`,
        html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FFFBF7; border-radius: 16px; border: 1px solid #FCE7F3;">
        <h2 style="color: ${brandColor}; margin-top: 0; font-size: 20px;">¡Hola!</h2>
        <p style="color: #57534E; line-height: 1.6; font-size: 15px;">Se ha detectado un nuevo inicio de sesión en tu cuenta de <strong>${brandName}</strong>.</p>
        <div style="background: #FFF1F2; padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #F472B6;">
          <p style="margin: 0; color: #881337; font-size: 14px;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 8px 0 0; color: #881337; font-size: 14px;"><strong>Fecha:</strong> ${new Date().toLocaleString("es-AR")}</p>
        </div>
        <p style="color: #57534E; line-height: 1.6; font-size: 15px;">Si no fuiste vos, te recomendamos cambiar tu contraseña de inmediato o contactarnos.</p>
        <p style="color: #A8A29E; font-size: 12px; margin-top: 24px; text-align: center;">${brandName} · ${brandLocation}</p>
         <p style="font-size: 14px; color: #78716C; text-align: center; margin-top: 24px;">
      Desarrollado por <a href="${tumarcaUrl}" style="color: ${brandColor};">www.tumarca.ar</a> <a href="${baseUrl}/perfil/alertas" style="color: ${brandColor};">Gestiona tus alertas aquí</a>.
    </p>
      </div>
    `
    };
};