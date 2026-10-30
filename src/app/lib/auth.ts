/* eslint-disable */
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from './mongoose';
import UserModel from '../models/User';
import ClienteModel from '../models/Cliente';
import AlertaModel from '../models/Alerta';
import { NextRequest } from 'next/server';
import LogModel from '../models/LogLogin';
import nodemailer from "nodemailer";

connectDB();

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

type ExtendedUser = {
  id: string;
  email: string;
  role: string;
  name: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  image: string;
  token: string;
};

// ✅ Función para normalizar teléfono
function normalizeTelefono(text?: string): string | null {
  if (!text) return null;
  const normalized = text
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^0-9+]/g, '');
  return normalized || null;
}

// ✅ Función para normalizar razón social
function normalizeRazonSocial(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// ✅ Función para crear cliente automáticamente (E-commerce)
async function crearClienteAutomatico(userData: {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  img?: string;
}) {
  try {
    const clienteExistente = await ClienteModel.findOne({ email: userData.email });
    if (clienteExistente) {
      return clienteExistente;
    }
    // ✅ Lógica inteligente para obtener nombre y apellido
    const nombreRaw = (userData.name || 'Cliente').trim();
    const apellidoRaw = (userData.lastName || '').trim();

    // Si Google solo mandó un nombre, lo usamos todo como nombre y ponemos 'Cliente' de apellido
    const nombre = nombreRaw || 'Cliente';
    const apellido = apellidoRaw || 'Cliente'; 
    
    const razonSocial = `${nombre} ${apellido} ${userData.email}`.trim();
    const razonSocialNormalized = normalizeRazonSocial(razonSocial);

    let telefono: string | null = null;
    let telefonoNormalized: string | null = null;

    const phoneTrimmed = userData.phone?.trim();
    if (phoneTrimmed && phoneTrimmed !== '00000000' && /[\d+]/.test(phoneTrimmed)) {
      telefono = phoneTrimmed;
      telefonoNormalized = normalizeTelefono(phoneTrimmed);
      const yaExiste = await ClienteModel.findOne({ telefonoNormalized });
      if (yaExiste) {
        telefono = null;
        telefonoNormalized = null;
      }
    }

    const clienteData: any = {
      razonSocial,
      razonSocialNormalized,
      nombre,
      apellido,
      email: userData.email,
      direccion: userData.address || '',
      ciudad: userData.city || 'Buenos Aires',
      provincia: 'Buenos Aires',
      formaPago: 'transferencia', // Adaptado para e-commerce
      activo: true,
      origen: 'registro_automatico'
    };

    if (telefono && telefonoNormalized) {
      clienteData.telefono = telefono;
      clienteData.telefonoNormalized = telefonoNormalized;
    }

    const nuevoCliente = new ClienteModel(clienteData);
    return await nuevoCliente.save();

  } catch (error: any) {
    console.error('❌ Error creando cliente automático:', error);

    if (error.code === 11000 || error.statusCode === 409) {
      try {
        const nombre = (userData.name || 'Cliente').trim();
        const apellido = (userData.lastName || '').trim();
        const razonSocial = `${nombre} ${apellido} ${userData.email}`.trim();

        const fallbackCliente = await ClienteModel.create({
          razonSocial,
          razonSocialNormalized: normalizeRazonSocial(razonSocial),
          nombre,
          apellido,
          email: userData.email,
          telefono: null,
          telefonoNormalized: null,
          direccion: userData.address || '',
          ciudad: userData.city || 'Buenos Aires',
          provincia: 'Buenos Aires',
          formaPago: 'transferencia',
          activo: true,
          origen: 'registro_automatico_fallback'
        });

        return fallbackCliente;
      } catch (fallbackError) {
        console.error('❌ Fallback también falló:', fallbackError);
        throw fallbackError;
      }
    }
    throw error;
  }
}

// === Función para enviar email de login (Estética Premium) ===
async function sendLoginEmail(to: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.MAILER_SERVICE || 'gmail',
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_SECRET_KEY,
      },
    });

    await transporter.sendMail({
      from: `"Candy Ilusiones" <${process.env.MAILER_EMAIL}>`,
      to,
      subject: "🔔 Nuevo inicio de sesión detectado",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FFFBF7; border-radius: 16px; border: 1px solid #FCE7F3;">
          <h2 style="color: #BE185D; margin-top: 0; font-size: 20px;">¡Hola!</h2>
          <p style="color: #57534E; line-height: 1.6; font-size: 15px;">Se ha detectado un nuevo inicio de sesión en tu cuenta de <strong>Candy Ilusiones</strong>.</p>
          <div style="background: #FFF1F2; padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #F472B6;">
            <p style="margin: 0; color: #881337; font-size: 14px;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 8px 0 0; color: #881337; font-size: 14px;"><strong>Fecha:</strong> ${new Date().toLocaleString("es-AR")}</p>
          </div>
          <p style="color: #57534E; line-height: 1.6; font-size: 15px;">Si no fuiste vos, te recomendamos cambiar tu contraseña de inmediato o contactarnos.</p>
          <p style="color: #A8A29E; font-size: 12px; margin-top: 24px; text-align: center;">Candy Ilusiones · Buenos Aires, Argentina</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("❌ Error enviando email de login:", error);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.ID_GOOGLE as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        await connectDB();
        const user = await UserModel.findOne({ email: credentials?.email });
        if (!user) throw new Error('Usuario no encontrado');
        
        const isMatch = await bcrypt.compare(credentials!.password, user.password);
        if (!isMatch) throw new Error('Contraseña incorrecta');

        if (user.role === 'user' || user.role === 'cliente') {
          await crearClienteAutomatico({
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            city: user.city,
            zipCode: user.zipCode,
            img: user.img
          });
        }

        const token = jwt.sign(
          {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            city: user.city,
            zipCode: user.zipCode
          },
          process.env.JWT_SECRET as string,
          { expiresIn: '30d' }
        );

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          lastName: user.lastName || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          zipCode: user.zipCode || '',
          image: user.img,
          token,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await connectDB();
      let esUsuarioNuevoGoogle = false;

      if (account?.provider === 'google') {
        let existingUser = await UserModel.findOne({ email: user.email });

               if (!existingUser) {
          esUsuarioNuevoGoogle = true;
          
          // ✅ Intentamos separar el nombre completo que da Google en nombre y apellido
          const fullName = user.name || 'Cliente Candy';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Cliente';

          existingUser = new UserModel({
            name: firstName,
            lastName: lastName, // ✅ Ahora siempre tendrá un valor válido
            phone: '',
            address: '',
            city: 'Buenos Aires',
            zipCode: '',
            email: user.email,
            img: user.image || '',
            password: await bcrypt.hash('google-auth', 10),
            role: 'user',
            google: true,
          });
          await existingUser.save();

          // ✅ Crear cliente + alerta de bienvenida
          if (existingUser.role === 'user' || existingUser.role === 'cliente') {
            const clienteGuardado = await crearClienteAutomatico({
              name: existingUser.name,
              lastName: existingUser.lastName,
              email: existingUser.email,
              phone: existingUser.phone,
              address: existingUser.address,
              city: existingUser.city,
              zipCode: existingUser.zipCode,
              img: existingUser.img
            });
            // ... (el resto del código de la alerta y email se queda igual)
            if (clienteGuardado?._id) {
              try {
                // 1. Crear alerta pre-configurada de NOVEDADES (adaptado a Candy Ilusiones)
                await AlertaModel.create({
                  usuario: existingUser._id,
                  cliente: clienteGuardado._id,
                  tipo: 'novedades', // Cambiado de 'busqueda' a 'novedades'
                  criterios: {
                    categorias: ['todas'],
                    incluyeOfertas: true,
                    recordatorioCumpleanos: true
                  },
                  frecuencia: 'semanal',
                  activo: true
                });

                // 2. Enviar email de bienvenida con estética Premium Pastel
                const transporter = nodemailer.createTransport({
                  service: process.env.MAILER_SERVICE || 'gmail',
                  auth: {
                    user: process.env.MAILER_EMAIL,
                    pass: process.env.MAILER_SECRET_KEY,
                  },
                });

                const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

                await transporter.sendMail({
                  from: `"Candy Ilusiones" <${process.env.MAILER_EMAIL}>`,
                  to: existingUser.email,
                  subject: '🎨 ¡Bienvenido + Alerta de Novedades activada!',
                  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; background: #FFFBF7; color: #57534E; }
    .header { background: linear-gradient(135deg, #F9A8D4, #FCA5A5, #FDE68A); padding: 40px 24px; text-align: center; border-radius: 16px 16px 0 0; }
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
    <h1>🎨 ¡Bienvenido a Candy Ilusiones!</h1>
    <p style="color: #9D174D; margin: 0; font-size: 16px; font-weight: 500;">Tu cuenta está lista para crear momentos únicos</p>
  </div>
  <div class="body">
    <p style="font-size: 16px; line-height: 1.6;">Hola <strong style="color: #BE185D;">${existingUser.name || existingUser.email.split('@')[0]}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.6;">Gracias por registrarte. Para que no te pierdas nada, <strong>ya activamos una alerta de novedades</strong> personalizada para vos:</p>
    
    <div class="card">
      <span class="badge">🔔 Alerta de Novedades</span>
      <p style="margin: 16px 0 0; font-weight: 700; color: #881337; font-size: 16px;">Nuevos diseños, sublimación y decoración</p>
      <p style="color: #9D174D; margin: 6px 0 0; font-size: 14px; line-height: 1.5;">📅 <strong>Frecuencia:</strong> Semanal</p>
      <p style="color: #9D174D; margin: 6px 0 0; font-size: 14px; line-height: 1.5;">🎁 <strong>Beneficio:</strong> Ofertas exclusivas para suscriptores</p>
    </div>

    <p style="font-size: 16px; line-height: 1.6;">Recibirás un email cada semana con las últimas creaciones y descuentos especiales. Podés gestionar tus preferencias en cualquier momento:</p>
    
    <div style="text-align: center; margin-top: 24px;">
      <a href="${baseUrl}/perfil/alertas" class="cta">Gestionar mis alertas →</a>
    </div>
    
    <p style="margin-top: 32px; font-size: 15px; color: #78716C; line-height: 1.6; text-align: center; font-style: italic;">
      "¿Tenés una idea en mente? Respondé este email y te ayudamos a hacerla realidad."
    </p>
  </div>
  <div class="footer">
    <p style="margin: 0 0 8px; font-weight: 700; color: #BE185D; font-size: 14px;">Candy Ilusiones</p>
    <p style="margin: 0;">© ${new Date().getFullYear()} · Buenos Aires, Argentina · Hecho con amor 💜</p>
  </div>
</body>
</html>`,
                  text: `
¡Bienvenido a Candy Ilusiones!

Hola ${existingUser.name || existingUser.email.split('@')[0]},

🔔 Alerta de Novedades activada:
• Nuevos diseños, sublimación y decoración
• 📅 Frecuencia: Semanal
• 🎁 Beneficio: Ofertas exclusivas para suscriptores

Recibirás un email cada semana con las últimas creaciones y descuentos especiales.
Gestionar alertas: ${baseUrl}/perfil/alertas

¿Tenés una idea en mente? Respondé este email y te ayudamos a hacerla realidad.

---
Candy Ilusiones · Buenos Aires, Argentina · Hecho con amor 💜
                  `.trim()
                });

                console.log(`✅ Email de bienvenida + alerta de novedades enviado a ${existingUser.email}`);
              } catch (alertError) {
                console.error('⚠️ Error creando alerta o enviando email de bienvenida:', alertError);
              }
            }
          }
        } else {
          // 👤 Usuario EXISTENTE con Google (pero quizás sin cliente)
          if (existingUser.role === 'user' || existingUser.role === 'cliente') {
            const clienteGuardado = await crearClienteAutomatico({
              name: existingUser.name,
              lastName: existingUser.lastName,
              email: existingUser.email,
              phone: existingUser.phone,
              address: existingUser.address,
              city: existingUser.city,
              zipCode: existingUser.zipCode,
              img: existingUser.img
            });

            if (clienteGuardado?._id) {
              try {
                const yaTieneAlertas = await AlertaModel.findOne({
                  usuario: existingUser._id,
                  tipo: 'novedades',
                  activo: true
                });

                if (!yaTieneAlertas) {
                  await AlertaModel.create({
                    usuario: existingUser._id,
                    cliente: clienteGuardado._id,
                    tipo: 'novedades',
                    criterios: {
                      categorias: ['todas'],
                      incluyeOfertas: true
                    },
                    frecuencia: 'semanal',
                    activo: true
                  });
                  console.log(`✅ Alerta de novedades creada para usuario existente: ${existingUser.email}`);
                }
              } catch (alertError) {
                console.error('⚠️ Error creando alerta para usuario existente:', alertError);
              }
            }
          }
        }

        // 🔑 Generar token JWT
        const token = jwt.sign(
          {
            id: existingUser.id.toString(),
            email: existingUser.email,
            role: existingUser.role,
            name: existingUser.name,
            lastName: existingUser.lastName,
            phone: existingUser.phone,
            address: existingUser.address,
            city: existingUser.city,
            zipCode: existingUser.zipCode,
          },
          process.env.JWT_SECRET as string,
          { expiresIn: '30d' }
        );

        // 🔗 Mapear user para NextAuth
        const u = user as ExtendedUser;
        u.id = existingUser.id.toString();
        u.role = existingUser.role;
        u.token = token;
        u.lastName = existingUser.lastName || '';
        u.phone = existingUser.phone || '';
        u.address = existingUser.address || '';
        u.city = existingUser.city || '';
        u.zipCode = existingUser.zipCode || '';
        u.image = existingUser.img || '';
        u.name = existingUser.name || '';
      }

      // ⬅️ REGISTRO EN BITÁCORA (ADMIN, SUPERADMIN Y VENDEDOR)
      try {
        const role =
          (user as any).role ||
          (account?.provider === 'google'
            ? (await UserModel.findOne({ email: user.email }))?.role
            : null);

        if (role === 'admin' || role === 'superadmin' || role === 'vendedor') {
          await LogModel.create({
            email: user.email,
            provider: account?.provider || 'credentials',
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error("Error guardando bitácora:", error);
      }

      // === ✅ Enviar email de login ===
      if (!esUsuarioNuevoGoogle) {
        try {
          await sendLoginEmail(user.email as string);
        } catch (emailError) {
          console.error('❌ Error enviando email de login:', emailError);
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const u = user as ExtendedUser;
        token.id = u.id;
        token.email = u.email;
        token.role = u.role;
        token.name = u.name;
        token.lastName = u.lastName;
        token.phone = u.phone;
        token.address = u.address;
        token.city = u.city;
        token.zipCode = u.zipCode;
        token.image = u.image;
        token.token = u.token;
      }
      return token;
    },

    async session({ session, token }) {
      const t = token as any;
      session.user.id = t.id;
      session.user.email = t.email;
      session.user.role = t.role;
      session.user.lastName = t.lastName;
      session.user.phone = t.phone;
      session.user.address = t.address;
      session.user.city = t.city;
      session.user.zipCode = t.zipCode;
      session.user.name = t.name;
      session.user.token = t.token || t.accessToken;
      return session;
    },
  },

  secret: process.env.JWT_SECRET,
};

// Helpers de admin
export const verifyAdmin = async (req: NextRequest): Promise<DecodedToken | null> => {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    // Permitimos admin, superadmin y vendedor para acceder al panel
    return ['admin', 'superadmin', 'vendedor'].includes(decoded.role) ? decoded : null;
  } catch {
    return null;
  }
};

export const verifyAdminToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return ['admin', 'superadmin', 'vendedor'].includes(decoded.role) ? decoded : null;
  } catch {
    return null;
  }
};