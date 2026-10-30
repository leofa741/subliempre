import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import ClienteModel from '@/app/models/Cliente';
import { verifyAdmin } from '@/app/lib/auth';


// ✅ GET: Obtener un solo cliente por su ID
export async function GET(  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // ✅ Cambiado a Promise
)  {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const cliente = await ClienteModel.findById(await (await params).id);

    if (!cliente) {
      return NextResponse.json({ message: 'Clienta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, cliente }, { status: 200 });
  } catch (error) {
    console.error('❌ Error obteniendo cliente:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const body = await req.json();
    const { nombre, apellido, telefono, email, direccion, ciudad, notas } = body;

    const clienteActualizado = await ClienteModel.findByIdAndUpdate(
      await (await params).id,
      { nombre, apellido, telefono, email, direccion, ciudad, notas },
      { new: true, runValidators: true }
    );

    if (!clienteActualizado) {
      return NextResponse.json({ message: 'Clienta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Clienta actualizada', cliente: clienteActualizado }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error actualizando cliente:', error);
    if (error.statusCode === 409) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    
    // Soft delete (desactivar en lugar de borrar para no romper historial de pedidos)
    const cliente = await ClienteModel.findByIdAndUpdate(
      await (await params).id,
      { activo: false },
      { new: true }
    );

    if (!cliente) {
      return NextResponse.json({ message: 'Clienta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Clienta desactivada exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('❌ Error desactivando cliente:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}


