export const getWelcomeEmailTemplate = (userName: string, email: string) => {
  const brandName = process.env.BRAND_NAME || 'Candy Ilusiones';
  const brandColor = process.env.BRAND_COLOR || '#BE185D';
  const brandGradient = process.env.BRAND_GRADIENT || 'linear-gradient(135deg, #F9A8D4, #FCA5A5, #FDE68A)';
  const brandLocation = process.env.BRAND_LOCATION || 'Buenos Aires, Argentina';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_APP_URL || 'https://www.candyilusiones.com.ar';
  const displayName = userName || email.split('@')[0];

  return {
    subject: `🎨 ¡Bienvenido a ${brandName} + Alerta de Novedades activada!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; background: #FFFBF7; color: #57534E; }
    .header { background: ${brandGradient}; padding: 40px 24px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { color: #881337; margin: 0 0 8px; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .body { padding: 32px 24px; background: #FFFFFF; border-radius: 0 0 16px 16px; border: 1px solid #FCE7F3; border-top: none; }
    .card { background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 16px; padding: 24px; margin: 20px 0; }
    .badge { display: inline-block; background: linear-gradient(135deg, #F472B6, #FB7185); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
    .cta { display: inline-block; background: linear-gradient(135deg, #F472B6, #FB7185); color: white; padding: 16px 36px; text-decoration: none; border-radius: 9999px; font-weight: 700; margin: 16px 0; font-size: 15px; box-shadow: 0 10px 25px -5px rgba(244, 114, 182, 0.4); }
    .footer { text-align: center; padding: 32px 24px; color: #A8A29E; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎨 ¡Bienvenido a ${brandName}!</h1>
    <p style="color: #9D174D; margin: 0; font-size: 16px; font-weight: 500;">Tu cuenta está lista para crear momentos únicos</p>
  </div>
  <div class="body">
    <p style="font-size: 16px; line-height: 1.6;">Hola <strong style="color: ${brandColor};">${displayName}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.6;">Gracias por registrarte. Para que no te pierdas nada, <strong>ya activamos una alerta de novedades</strong> personalizada para vos:</p>
    
    <div class="card">
      <span class="badge">🔔 Alerta de Novedades</span>
      <p style="margin: 16px 0 0; font-weight: 700; color: #881337; font-size: 16px;">Nuevos diseños, sublimación y decoración</p>
      <p style="color: #9D174D; margin: 6px 0 0; font-size: 14px; line-height: 1.5;">📅 <strong>Frecuencia:</strong> Semanal</p>
      <p style="color: #9D174D; margin: 6px 0 0; font-size: 14px; line-height: 1.5;">🎁 <strong>Beneficio:</strong> Ofertas exclusivas para suscriptores</p>
    </div>

    <p style="font-size: 16px; line-height: 1.6;">Recibirás un email cada semana con las últimas creaciones y descuentos especiales. Podés gestionar tus preferencias en cualquier momento:</p>
    
  
    
    <p style="margin-top: 32px; font-size: 15px; color: #78716C; line-height: 1.6; text-align: center; font-style: italic;">
      "¿Tenés una idea en mente? Respondé este email y te ayudamos a hacerla realidad."
    </p>
  </div>
  <div class="footer">
    <p style="margin: 0 0 8px; font-weight: 700; color: ${brandColor}; font-size: 14px;">${brandName}</p>
    <p style="margin: 0;">© ${new Date().getFullYear()} · ${brandLocation} · Hecho con amor 💜</p>
  </div>
</body>
</html>`,
    text: `
¡Bienvenido a ${brandName}!

Hola ${displayName},

🔔 Alerta de Novedades activada:
• Nuevos diseños, sublimación y decoración
• 📅 Frecuencia: Semanal
• 🎁 Beneficio: Ofertas exclusivas para suscriptores

Recibirás un email cada semana con las últimas creaciones y descuentos especiales.


¿Tenés una idea en mente? Respondé este email y te ayudamos a hacerla realidad.



---
${brandName} · ${brandLocation} · Hecho con amor 💜
    `.trim()
  };
};