import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────────────────
// 🔹 TIPOS PARA EL FORMULARIO (Candy Ilusiones)
// ─────────────────────────────────────────────────────────────
interface ContactForm {
  name: string;
  contact: string;
  interest: 'general' | 'sublimacion' | 'cumpleaños' | 'remeras' | 'mayorista';
  message: string;
  subject?: string;
}

// ─────────────────────────────────────────────────────────────
// 🔹 MAPEOS LEGIBLES PARA EL EMAIL
// ─────────────────────────────────────────────────────────────
const interestLabels: Record<string, string> = {
  general: 'Consulta general',
  sublimacion: 'Presupuesto de sublimación',
  cumpleaños: 'Decoración de cumpleaños',
  remeras: 'Remeras personalizadas',
  mayorista: 'Ventas mayoristas',
};

// ─────────────────────────────────────────────────────────────
// 🔹 HANDLER PRINCIPAL
// ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body: ContactForm = await req.json();
    const { name, contact, interest, message } = body;

    if (!name?.trim() || !contact?.trim() || !message?.trim() || !interest) {
      return NextResponse.json(
        { success: false, message: 'Por favor, completá los campos obligatorios.' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: process.env.MAILER_SERVICE || 'gmail',
      host: process.env.MAILER_HOST,
      port: parseInt(process.env.MAILER_PORT || '587'),
      secure: process.env.MAILER_SECURE === 'true',
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_SECRET_KEY,
      },
    });

    await transporter.verify();

    const emailContent = buildEmailContent(body);

    const mailOptions = {
      from: `"Candy Ilusiones" <${process.env.MAILER_EMAIL}>`,
      to: process.env.MAILER_EMAIL,
      cc: process.env.MAILER_CC ? process.env.MAILER_CC.split(',').map((e: string) => e.trim()) : undefined,
      subject: `🎨 Nueva consulta: ${interestLabels[interest]} - ${name}`,
      html: emailContent,
      text: buildTextContent(body),
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Email enviado: ${interest} - ${contact}`);

    return NextResponse.json({ 
      success: true, 
      message: '¡Mensaje enviado con éxito! Te responderemos a la brevedad.' 
    });

  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Ocurrió un error al enviar tu consulta. Por favor, intentá de nuevo o contactanos por WhatsApp.' 
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// 🔹 PLANTILLA HTML PREMIUM (Paleta Candy Pastel)
// ─────────────────────────────────────────────────────────────
function buildEmailContent(data: ContactForm): string {
  const { name, contact, interest, message } = data;
  
  const styles = {
    container: 'font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background-color: #faf5ff;',
    header: 'background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #22d3ee 100%); padding: 32px 24px; text-align: center; border-radius: 16px 16px 0 0;',
    headerTitle: 'color: white; font-size: 26px; font-weight: bold; margin: 0 0 8px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);',
    headerSubtitle: 'color: rgba(255,255,255,0.95); font-size: 15px; margin: 0; font-weight: 500;',
    body: 'background: #ffffff; padding: 32px 24px; border-radius: 0 0 16px 16px; border: 2px solid #e9d5ff; border-top: none;',
    card: 'background: #faf5ff; padding: 20px; border-radius: 12px; margin-bottom: 16px; border: 1px solid #f3e8ff;',
    label: 'color: #9333ea; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 6px 0; font-weight: bold;',
    value: 'color: #581c87; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;',
    messageBox: 'background: #fdf4ff; padding: 20px; border-radius: 12px; border-left: 5px solid #d946ef; margin: 16px 0;',
    messageText: 'color: #6b21a8; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;',
    footer: 'text-align: center; padding: 24px; color: #a855f7; font-size: 13px; background-color: #faf5ff; border-radius: 0 0 16px 16px;',
    badge: 'display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.2);',
    divider: 'height: 2px; background: linear-gradient(to right, transparent, #e9d5ff, transparent); margin: 24px 0;',
    button: 'display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; padding: 14px 36px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3); transition: transform 0.2s;',
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva consulta - Candy Ilusiones</title>
    </head>
    <body style="${styles.container}">
      
      <div style="${styles.header}">
        <h1 style="${styles.headerTitle}">✨ Nueva Consulta</h1>
        <p style="${styles.headerSubtitle}">Candy Ilusiones - Productos Personalizados</p>
      </div>

      <div style="${styles.body}">
        
        <div style="text-align: center; margin-bottom: 28px;">
          <span style="${styles.badge}">${interestLabels[interest] || interest}</span>
        </div>

        <div style="${styles.card}">
          <p style="${styles.label}">Nombre completo</p>
          <p style="${styles.value}">${name}</p>
          
          <p style="${styles.label}">Email o Teléfono de contacto</p>
          <p style="${styles.value}">${contact}</p>
        </div>

        <div style="${styles.card}">
          <p style="${styles.label}">Mensaje del cliente</p>
          <div style="${styles.messageBox}">
            <p style="${styles.messageText}">${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>

        <div style="${styles.divider}"></div>

        <div style="text-align: center; margin-top: 28px;">
          <a href="mailto:${contact.includes('@') ? contact : ''}?subject=Re: Consulta Candy Ilusiones" 
             style="${styles.button}">
            Responder a ${name}
          </a>
        </div>

      </div>

      <div style="${styles.footer}">
        <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 15px;">Candy Ilusiones 🎨</p>
        <p style="margin: 0 0 4px 0;">📧 ${process.env.MAILER_EMAIL}</p>
        <p style="margin: 0;">Este mensaje fue enviado desde el formulario de contacto web.</p>
      </div>

    </body>
    </html>
  `;
}

// ─────────────────────────────────────────────────────────────
// 🔹 VERSIÓN TEXTO PLANO (FALLBACK)
// ─────────────────────────────────────────────────────────────
function buildTextContent(data: ContactForm): string {
  const { name, contact, interest, message } = data;
  
  return `
NUEVA CONSULTA - CANDY ILUSIONES 🎨
========================================================

INTERÉS: ${interestLabels[interest] || interest}

CONTACTO:
• Nombre: ${name}
• Email/Teléfono: ${contact}

MENSAJE:
${message}

---
Responder a: ${contact}
Enviado desde: Formulario web Candy Ilusiones
  `.trim();
}