import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/app/lib/mongoose';
import DisenoPersonalizadoModel from '@/app/models/DisenoPersonalizado';
import UserModel from '@/app/models/User';

// ✅ GET: Obtener detalle de un diseño (cliente o admin)
export async function GET(  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // ✅ Cambiado a Promise
)  {
  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    // Forzamos el tipo para evitar que TS piense que es un array
    const diseno = await DisenoPersonalizadoModel.findById((await params).id).lean() as any;

    if (!diseno) {
      return NextResponse.json({ message: 'Diseño no encontrado' }, { status: 404 });
    }

    // Si es cliente, solo puede ver los suyos
    if (token.role === 'user' || token.role === 'cliente') {
      // Usamos String() para una comparación segura de IDs
      if (String(diseno.cliente) !== String(token.id)) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, diseno });

  } catch (error) {
    console.error('❌ Error obteniendo diseño:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}

// ✅ PUT: Admin actualiza estado o envía mensaje
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token || !['admin', 'superadmin', 'vendedor'].includes(token.role as string)) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { estado, mensaje, imagenMensaje } = body;

    const diseno = await DisenoPersonalizadoModel.findById((await params).id);
    if (!diseno) {
      return NextResponse.json({ message: 'Diseño no encontrado' }, { status: 404 });
    }

    // Actualizar estado si se envió
    if (estado) {
      diseno.estado = estado;
      if (estado !== 'pendiente') {
        diseno.fechaRespuestaAdmin = new Date();
      }
    }

    // Agregar mensaje si se envió
    if (mensaje?.trim()) {
      const adminUser = await UserModel.findById(token.id);
      diseno.mensajes.push({
        autor: 'admin',
        nombreAutor: adminUser?.name || 'Equipo',
        contenido: mensaje.trim(),
        imagen: imagenMensaje || null,
        createdAt: new Date()
      });
    }

    await diseno.save();

    return NextResponse.json({
      success: true,
      message: 'Diseño actualizado',
      diseno
    });

  } catch (error) {
    console.error('❌ Error actualizando diseño:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}

// ✅ POST (dentro de [id]): Cliente envía mensaje o aprueba diseño
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { mensaje, accion } = body; // accion: 'aprobar' | 'rechazar' | 'mensaje'

    const diseno = await DisenoPersonalizadoModel.findById((await params).id);
    if (!diseno) {
      return NextResponse.json({ message: 'Diseño no encontrado' }, { status: 404 });
    }

    // Verificar que sea el dueño (usando String() para evitar errores de tipo)
    if (String(diseno.cliente) !== String(token.id)) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    // Agregar mensaje del cliente
    if (mensaje?.trim()) {
      const user = await UserModel.findById(token.id);
      diseno.mensajes.push({
        autor: 'cliente',
        nombreAutor: user?.name || 'Cliente',
        contenido: mensaje.trim(),
        createdAt: new Date()
      });
    }

    // Si aprueba o rechaza la vista previa
    if (accion === 'aprobar') {
      diseno.estado = 'aprobado';
      diseno.fechaAprobacionCliente = new Date();
    } else if (accion === 'rechazar') {
      diseno.estado = 'consulta';
    }

    await diseno.save();

    return NextResponse.json({
      success: true,
      message: 'Respuesta registrada',
      diseno
    });

  } catch (error) {
    console.error('❌ Error del cliente:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}