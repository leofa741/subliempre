import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import ClienteModel from '@/app/models/Cliente';
import { verifyAdmin } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const busqueda = searchParams.get('busqueda') || '';
    const pagina = parseInt(searchParams.get('pagina') || '1', 10);
    const limite = parseInt(searchParams.get('limite') || '10', 10);

    const query: any = { activo: true };
    if (busqueda) {
      const regex = new RegExp(busqueda, 'i');
      query.$or = [
        { nombre: regex },
        { apellido: regex },
        { telefono: regex },
        { email: regex }
      ];
    }

    const total = await ClienteModel.countDocuments(query);
    const clientes = await ClienteModel.find(query)
      .sort({ createdAt: -1 })
      .skip((pagina - 1) * limite)
      .limit(limite);

    return NextResponse.json({ 
      success: true, 
      clientes, 
      total,
      paginas: Math.ceil(total / limite) || 1
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Error obteniendo clientes:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const body = await req.json();
    const { nombre, apellido, telefono, email, direccion, ciudad, notas } = body;

    if (!nombre?.trim() || !telefono?.trim()) {
      return NextResponse.json({ message: 'El nombre y el teléfono son obligatorios.' }, { status: 400 });
    }

    const nuevoCliente = await ClienteModel.create({
      nombre: nombre.trim(),
      apellido: apellido?.trim() || '',
      telefono: telefono.trim(),
      email: email?.trim().toLowerCase() || undefined,
      direccion: direccion?.trim() || '',
      ciudad: ciudad?.trim() || '',
      notas: notas?.trim() || '',
      activo: true
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Clienta registrada exitosamente', 
      cliente: nuevoCliente 
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creando cliente:', error);
    
    // ✅ MANEJO AMIGABLE DE ERRORES DE DUPLICIDAD (MongoDB Code 11000)
    if (error.code === 11000) {
      const campoDuplicado = Object.keys(error.keyValue)[0];
      const valorDuplicado = error.keyValue[campoDuplicado];
      
      let mensajeAmigable = 'Ya existe una clienta registrada con estos datos.';
      
      if (campoDuplicado === 'email') {
        mensajeAmigable = `Ya existe una clienta registrada con el correo: "${valorDuplicado}". Por favor, verifica si ya está en el sistema o usa otro correo.`;
      } else if (campoDuplicado === 'telefono') {
        mensajeAmigable = `Ya existe una clienta registrada con el teléfono: "${valorDuplicado}".`;
      }
      
      return NextResponse.json({ message: mensajeAmigable }, { status: 409 });
    }

    // Otros errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const primerError = Object.values(error.errors)[0] as any;
      return NextResponse.json({ message: primerError?.message || 'Datos incompletos o inválidos.' }, { status: 400 });
    }

    // Error genérico
    return NextResponse.json({ 
      message: 'Ocurrió un error inesperado al guardar los datos. Por favor, inténtalo de nuevo.' 
    }, { status: 500 });
  }
}