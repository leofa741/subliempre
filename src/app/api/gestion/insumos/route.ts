import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import InsumoModel from '@/app/models/Insumo';
import { verifyAdmin } from '@/app/lib/auth';

// ✅ GET: Obtener lista de insumos activos
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    await connectDB();
    
    // Obtenemos solo los insumos activos, ordenados por los más recientes
    const insumos = await InsumoModel.find({ activo: true })
      .sort({ createdAt: -1 })
      .select('-__v');

    return NextResponse.json({ success: true, insumos }, { status: 200 });
  } catch (error) {
    console.error('❌ Error obteniendo insumos:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ POST: Crear un nuevo insumo
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    const { nombre, categoria, costo, cantidadPaquete, unidadMedida, stockActual } = body;

    if (!nombre || !categoria || costo === undefined || cantidadPaquete === undefined || !unidadMedida) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un insumo con el mismo nombre (case-insensitive)
    const existe = await InsumoModel.findOne({ 
      nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
      activo: true 
    });

    if (existe) {
      return NextResponse.json(
        { message: 'Ya existe un insumo con ese nombre' },
        { status: 409 }
      );
    }

    const nuevoInsumo = await InsumoModel.create({
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      costo: Number(costo),
      cantidadPaquete: Number(cantidadPaquete),
      unidadMedida: unidadMedida.trim(),
      stockActual: Number(stockActual) || 0,
      creadoPor: admin.id
    });

    return NextResponse.json(
      { success: true, message: 'Insumo creado exitosamente', insumo: nuevoInsumo },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Error creando insumo:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}