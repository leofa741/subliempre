/* eslint-disable */
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

import connectDB from './mongoose';
import UserModel from '../models/User';
import ClienteModel from '../models/Cliente';
import AlertaModel from '../models/Alerta';
import LogModel from '../models/LogLogin';
import { emailTransporter } from './emails/transporter';
import { getLoginAlertTemplate } from './emails/templates/loginAlert';
import { getWelcomeEmailTemplate } from './emails/templates/welcomeEmail';



// 🚨 SALVAGUARDAS CRÍTICAS
if (!process.env.NEXTAUTH_SECRET) throw new Error("❌ FALTA LA VARIABLE DE ENTORNO: NEXTAUTH_SECRET");
if (!process.env.ID_GOOGLE || !process.env.GOOGLE_SECRET) throw new Error("❌ FALTAN VARIABLES DE ENTORNO: ID_GOOGLE o GOOGLE_SECRET");
if (!process.env.JWT_SECRET) throw new Error("❌ FALTA LA VARIABLE DE ENTORNO: JWT_SECRET");

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
  const normalized = text.trim().replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  return normalized || null;
}

// ✅ Función para normalizar razón social
function normalizeRazonSocial(text: string): string {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
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
    if (clienteExistente) return clienteExistente;

    const nombreRaw = (userData.name || 'Cliente').trim();
    const apellidoRaw = (userData.lastName || '').trim();
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

    const telefonoFinal = telefono || `SIN_TELEFONO_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const clienteData: any = {
      razonSocial,
      razonSocialNormalized,
      nombre,
      apellido,
      email: userData.email,
      direccion: userData.address || '',
      ciudad: userData.city || 'Buenos Aires',
      provincia: 'Buenos Aires',
      formaPago: 'transferencia',
      activo: true,
      origen: 'registro_automatico',
      telefono: telefonoFinal,
      telefonoNormalized: telefonoNormalized
    };

    const nuevoCliente = new ClienteModel(clienteData);
    return await nuevoCliente.save();

  } catch (error: any) {
    console.error('❌ Error creando cliente automático:', error);
    if (error.code === 11000 || error.statusCode === 409) {
      try {
        const nombre = (userData.name || 'Cliente').trim();
        const apellido = (userData.lastName || '').trim();
        const razonSocial = `${nombre} ${apellido} ${userData.email}`.trim();

        return await ClienteModel.create({
          razonSocial,
          razonSocialNormalized: normalizeRazonSocial(razonSocial),
          nombre,
          apellido,
          email: userData.email,
          telefono: `SIN_TELEFONO_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          telefonoNormalized: null,
          direccion: userData.address || '',
          ciudad: userData.city || 'Buenos Aires',
          provincia: 'Buenos Aires',
          formaPago: 'transferencia',
          activo: true,
          origen: 'registro_automatico_fallback'
        });
      } catch (fallbackError) {
        console.error('❌ Fallback también falló:', fallbackError);
        throw fallbackError;
      }
    }
    throw error;
  }
}

// 📧 FUNCIÓN CENTRALIZADA DE ENVÍO DE EMAILS
async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text?: string }) {
  try {
    await emailTransporter.sendMail({
      from: `"${process.env.BRAND_NAME || 'Candy Ilusiones'}" <${process.env.MAILER_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });
    return true;
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    return false;
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
          
          const fullName = user.name || 'Cliente';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Cliente';

          existingUser = new UserModel({
            name: firstName,
            lastName: lastName,
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
                await AlertaModel.create({
                  usuario: existingUser._id,
                  cliente: clienteGuardado._id,
                  tipo: 'novedades',
                  criterios: { categorias: ['todas'], incluyeOfertas: true, recordatorioCumpleanos: true },
                  frecuencia: 'semanal',
                  activo: true
                });

                // 🎯 USAMOS LA PLANTILLA REUTILIZABLE
                const emailData = getWelcomeEmailTemplate(existingUser.name || '', existingUser.email);
                await sendEmail({
                  to: existingUser.email,
                  subject: emailData.subject,
                  html: emailData.html,
                  text: emailData.text
                });

                console.log(`✅ Email de bienvenida enviado a ${existingUser.email}`);
              } catch (alertError) {
                console.error('⚠️ Error creando alerta o enviando email:', alertError);
              }
            }
          }
        } else {
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
                const yaTieneAlertas = await AlertaModel.findOne({ usuario: existingUser._id, tipo: 'novedades', activo: true });
                if (!yaTieneAlertas) {
                  await AlertaModel.create({
                    usuario: existingUser._id,
                    cliente: clienteGuardado._id,
                    tipo: 'novedades',
                    criterios: { categorias: ['todas'], incluyeOfertas: true },
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

      try {
        const role = (user as any).role || (account?.provider === 'google' ? (await UserModel.findOne({ email: user.email }))?.role : null);
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

      // 🎯 EMAIL DE LOGIN PARA USUARIOS EXISTENTES (NO NUEVOS)
      if (!esUsuarioNuevoGoogle) {
        const loginEmailData = getLoginAlertTemplate(user.email as string);
        await sendEmail({
          to: user.email as string,
          subject: loginEmailData.subject,
          html: loginEmailData.html
        });
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