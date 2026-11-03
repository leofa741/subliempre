import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/app/lib/mongoose';
import DisenoPersonalizadoModel from '@/app/models/DisenoPersonalizado';
import UserModel from '@/app/models/User';

// ✅ IMPORTAMOS EL TRANSPORTE Y LA PLANTILLA (Mismo patrón que en productos)
import { emailTransporter } from '@/app/lib/emails/transporter';
import { getNewDesignRequestAlertTemplate } from '@/app/lib/emails/templates/newDesignRequestAlert';

// ✅ POST: Cliente crea una nueva solicitud de diseño
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const {
      titulo, tipoProducto, descripcion, colores, textoDeseado,
      cantidad, fechaLimite, presupuestoEstimado, imagenesReferencia
    } = body;

    if (!titulo?.trim() || !tipoProducto || !descripcion?.trim()) {
      return NextResponse.json(
        { message: 'Título, tipo de producto y descripción son obligatorios.' },
        { status: 400 }
      );
    }

    const usuario = await UserModel.findById(token.id);
    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const nuevoDiseno = await DisenoPersonalizadoModel.create({
      cliente: token.id,
      nombreCliente: `${usuario.name} ${usuario.lastName || ''}`.trim(),
      emailCliente: usuario.email,
      telefonoCliente: usuario.phone || '',
      titulo: titulo.trim(),
      tipoProducto,
      descripcion: descripcion.trim(),
      colores: colores?.trim() || '',
      textoDeseado: textoDeseado?.trim() || '',
      cantidad: Number(cantidad) || 1,
      fechaLimite: fechaLimite || null,
      presupuestoEstimado: presupuestoEstimado ? Number(presupuestoEstimado) : null,
      imagenesReferencia: imagenesReferencia || [],
      estado: 'pendiente',
      mensajes: [{
        autor: 'cliente',
        nombreAutor: usuario.name,
        contenido: descripcion.trim(),
        createdAt: new Date()
      }]
    });

    // 🚀 ENVIAR ALERTA POR EMAIL A ADMINS Y SUPERADMINS 
    // (Usando exactamente el mismo patrón que en productos/route.ts)
    try {
      const admins = await UserModel.find({ 
        role: { $in: ['admin', 'superadmin'] } 
      }).select('email name');

      if (admins.length > 0) {
        const adminPanelUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_APP_URL || 'https://www.candyilusiones.com.ar';
        const productTypeLabel = tipoProducto.replace('_', ' ').toUpperCase();

        const emailData = getNewDesignRequestAlertTemplate(
          nuevoDiseno.nombreCliente,
          productTypeLabel,
          nuevoDiseno.titulo,
          adminPanelUrl,
          nuevoDiseno._id.toString()
        );

        // Enviar a cada administrador usando emailTransporter.sendMail
        for (const admin of admins) {
          await emailTransporter.sendMail({
            from: `"${process.env.BRAND_NAME || 'Candy Ilusiones'}" <${process.env.MAILER_EMAIL}>`,
            to: admin.email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text
          });
        }
        
        console.log(`✅ Alerta de nuevo diseño enviada a ${admins.length} administrador(es).`);
      }
    } catch (emailError) {
      // ⚠️ IMPORTANTE: Si falla el email, NO lanzamos error para no romper la creación del diseño
      console.error('⚠️ Error enviando alertas de nuevo diseño a admins:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: '¡Solicitud enviada! Te responderemos en menos de 24hs.',
      diseno: nuevoDiseno
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creando diseño personalizado:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ GET: Cliente lista SUS diseños
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const disenos = await DisenoPersonalizadoModel.find({ cliente: token.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, disenos });

  } catch (error) {
    console.error('❌ Error listando diseños:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}